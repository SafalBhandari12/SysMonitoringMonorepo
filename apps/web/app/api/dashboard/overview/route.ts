import { getUserId } from "@/lib/auth-utils";
import { cacheKey, getCached, setCached } from "@/lib/cache";
import { prisma } from "@/prisma";
import { TDigest } from "tdigest";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dashboardSearchParamsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["uptime", "p90", "p99"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  groupId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const pageParam = request.nextUrl.searchParams.get("page");
    const limitParam = request.nextUrl.searchParams.get("limit");
    const searchParam = request.nextUrl.searchParams.get("search");
    const sortByParam = request.nextUrl.searchParams.get("sortBy");
    const sortDirParam = request.nextUrl.searchParams.get("sortDir");
    const groupIdParam = request.nextUrl.searchParams.get("groupId");
    const { page, limit, search, sortBy, sortDir, groupId } =
      dashboardSearchParamsSchema.parse({
        page: pageParam ? Number(pageParam) : undefined,
        limit: limitParam ? Number(limitParam) : undefined,
        search: searchParam || undefined,
        sortBy: sortByParam || undefined,
        sortDir: sortDirParam || undefined,
        groupId: groupIdParam || undefined,
      });

    const key = cacheKey(
      "dashboard",
      "overview",
      userId,
      page,
      limit,
      search || "all",
      sortBy || "default",
      sortDir || "asc",
      groupId || "all",
    );
    const cached = await getCached(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [apiGroupsCount, apisCount, incident, apiDigests, apis, apiGroups] =
      await Promise.all([
        prisma.apiGroup.count({
          where: {
            userId,
          },
        }),
        prisma.api.count({
          where: {
            apiGroup: {
              userId,
            },
          },
        }),
        prisma.incident.findMany({
          where: {
            api: {
              apiGroup: {
                userId,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            title: true,
            regions: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        }),
        prisma.apiDigest.findMany({
          where: {
            api: { apiGroup: { userId } },
            windowKey: {
              gte: since.toISOString(),
            },
          },
          select: {
            digest: true,
          },
        }),
        prisma.api.findMany({
          where: {
            apiGroup: { userId },
            ...(search && { name: { contains: search, mode: "insensitive" } }),
            ...(groupId && { apiGroupId: groupId }),
          },
          select: {
            id: true,
            name: true,
            apiGroup: {
              select: {
                id: true,
                name: true,
              },
            },
            metrics: {
              select: {
                region: true,
                upCount: true,
                totalCount: true,
                p90ResponseTime: true,
                p99ResponseTime: true,
              },
            },
          },
          ...(page && limit && { skip: (page - 1) * limit, take: limit }),
        }),
        prisma.apiGroup.findMany({
          where: { userId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ]);

    let p90: string | null = null;
    let p99: string | null = null;

    if (apiDigests.length > 0) {
      const merged = new TDigest();
      for (const apiDigest of apiDigests) {
        const data = apiDigest.digest as {
          centroids: { mean: number; count: number }[];
          n: number;
        };

        for (const centroid of data.centroids) {
          merged.push(centroid.mean, centroid.count);
        }
      }

      p90 = merged.percentile(0.9).toPrecision(3);
      p99 = merged.percentile(0.99).toPrecision(3);
    }

    const apiStatusRows = apis.map((api) => {
      const totals = api.metrics.reduce(
        (acc, metric) => {
          const weight = metric.totalCount > 0 ? metric.totalCount : 1;
          return {
            upCount: acc.upCount + metric.upCount,
            totalCount: acc.totalCount + metric.totalCount,
            p90Total: acc.p90Total + metric.p90ResponseTime * weight,
            p99Total: acc.p99Total + metric.p99ResponseTime * weight,
            weight: acc.weight + weight,
          };
        },
        { upCount: 0, totalCount: 0, p90Total: 0, p99Total: 0, weight: 0 },
      );

      const uptime =
        totals.totalCount > 0
          ? (totals.upCount / totals.totalCount) * 100
          : null;
      const p90Value =
        totals.weight > 0 ? totals.p90Total / totals.weight : null;
      const p99Value =
        totals.weight > 0 ? totals.p99Total / totals.weight : null;

      return {
        id: api.id,
        name: api.name,
        apiGroupName: api.apiGroup?.name || "Unknown",
        status: uptime !== null && uptime >= 99 ? "UP" : "DOWN",
        uptime,
        p90: p90Value,
        p99: p99Value,
      };
    });

    // Apply sorting if specified
    if (sortBy) {
      apiStatusRows.sort((a, b) => {
        let aValue: number | null = null;
        let bValue: number | null = null;

        if (sortBy === "uptime") {
          aValue = a.uptime;
          bValue = b.uptime;
        } else if (sortBy === "p90") {
          aValue = a.p90;
          bValue = b.p90;
        } else if (sortBy === "p99") {
          aValue = a.p99;
          bValue = b.p99;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDir === "asc" ? 1 : -1;
        if (bValue === null) return sortDir === "asc" ? -1 : 1;

        const comparison = aValue - bValue;
        return sortDir === "asc" ? comparison : -comparison;
      });
    }

    const response = {
      stats: {
        apiGroupsCount,
        apisCount,
        incidentCount: incident.length,
        p90,
        p99,
      },
      incidents: incident,
      apis: apiStatusRows,
      availableGroups: apiGroups,
    };

    await setCached(key, response, 60);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch dashboard overview" },
      { status: 500 },
    );
  }
}
