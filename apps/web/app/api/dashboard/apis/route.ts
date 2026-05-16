import { getUserId } from "@/lib/auth-utils";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jsonSchema: z.ZodType<Prisma.InputJsonValue | null> = z.json().nullable();

const createApiSchema = z.object({
  name: z.string().trim().min(1),
  targetUrl: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  apiGroupId: z.string().trim().min(1),
  headers: jsonSchema,
  body: jsonSchema,
  pathParams: jsonSchema,
  queryParams: jsonSchema,
});

// targetUrl is required (no path compatibility)
const createApiSchemaRefined = createApiSchema;

function toNullableJson(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

export async function GET() {
  try {
    const userId = await getUserId();
    const key = cacheKey("dashboard", "apis", userId);
    const cached = await getCached(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const apis = await prisma.api.findMany({
      where: { apiGroup: { userId } },
      select: { id: true, name: true, method: true, targetUrl: true },
      orderBy: { createdAt: "desc" },
    });

    // Build last-N-days range (default 90)
    const days = 90;
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    // fetch all dailyStats for these apis in the date range
    const apiIds = apis.map((a) => a.id);
    const stats =
      apiIds.length > 0
        ? await prisma.dailyStats.findMany({
            where: {
              apiId: { in: apiIds },
              date: { gte: start, lte: end },
            },
            select: {
              apiId: true,
              date: true,
              upCount: true,
              totalCount: true,
            },
            orderBy: { date: "asc" },
          })
        : [];

    // helper to format date to YYYY-MM-DD
    function formatDate(d: Date) {
      return d.toISOString().slice(0, 10);
    }

    // Build map apiId -> date -> stat
    const map = new Map<
      string,
      Map<string, { upCount: number; totalCount: number }>
    >();
    for (const s of stats) {
      const dkey = formatDate(new Date(s.date));
      if (!map.has(s.apiId)) map.set(s.apiId, new Map());
      map
        .get(s.apiId)!
        .set(dkey, { upCount: s.upCount, totalCount: s.totalCount });
    }

    // build uptime arrays per api
    const apisWithUptime = apis.map((a) => {
      const perApiMap = map.get(a.id) || new Map();
      const result: Array<{
        date: string;
        up: boolean;
        upCount: number;
        totalCount: number;
      }> = [];
      for (
        let d = new Date(start);
        d <= end;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const key = formatDate(new Date(d));
        const stat = perApiMap.get(key);
        if (stat) {
          const up =
            stat.upCount > 0 && stat.totalCount > 0 ? stat.upCount >= 1 : false;
          result.push({
            date: key,
            up,
            upCount: stat.upCount,
            totalCount: stat.totalCount,
          });
        } else {
          result.push({ date: key, up: false, upCount: 0, totalCount: 0 });
        }
      }

      return { ...a, uptime: result };
    });

    void setCached(key, apisWithUptime, 300);

    return NextResponse.json(apisWithUptime);
  } catch (error) {
    console.error("Error fetching APIs:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch APIs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const payload = createApiSchemaRefined.parse(await request.json());

    // Verify the API group belongs to the user
    const apiGroup = await prisma.apiGroup.findUnique({
      where: { id: payload.apiGroupId },
      select: { userId: true },
    });

    if (!apiGroup || apiGroup.userId !== userId) {
      return NextResponse.json(
        { error: "API group not found or unauthorized" },
        { status: 403 },
      );
    }

    // Persist API with required `targetUrl` and `apiGroupId`
    try {
      await prisma.api.create({
        data: {
          name: payload.name,
          targetUrl: payload.targetUrl,
          method: payload.method,
          apiGroupId: payload.apiGroupId,
          headers: toNullableJson(payload.headers),
          body: toNullableJson(payload.body),
          pathParams: toNullableJson(payload.pathParams),
          queryParams: toNullableJson(payload.queryParams),
        },
      });
    } catch (error: any) {
      // Handle unique constraint violation (targetUrl already exists)
      if (error?.code === "P2002") {
        const field = error?.meta?.target?.[0] || "targetUrl";
        return NextResponse.json(
          {
            error: `An API with this ${field} already exists. Please use a different URL.`,
          },
          { status: 409 },
        );
      }
      // Re-throw other errors
      throw error;
    }

    await Promise.all([
      deleteCachedPattern(cacheKey("dashboard", "apis", userId)),
      deleteCachedPattern(cacheKey("dashboard", "overview", userId, "*")),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating API:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create API" },
      { status: 500 },
    );
  }
}
