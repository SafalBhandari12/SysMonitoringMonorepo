import { getUserId } from "@/lib/auth-utils";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { getApi } from "@/lib/getApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createApiGroupSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
});

// Compact sparkline window for the group cards; the detail page uses the full 90 days.
const CARD_UPTIME_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const query = request.nextUrl.searchParams.get("q") || "";
    const withStats = request.nextUrl.searchParams.get("withStats") === "true";
    const key = cacheKey(
      "dashboard",
      "api-groups",
      userId,
      query || "all",
      withStats ? "stats" : "plain",
    );
    const cached = await getCached(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const apiGroups = await prisma.apiGroup.findMany({
      where: {
        userId,
        ...(query && {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: query && !withStats ? 10 : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!withStats) {
      void setCached(key, apiGroups, query ? 30 : 300);
      return NextResponse.json(apiGroups);
    }

    const grouped = await getApi(userId, CARD_UPTIME_DAYS);
    const statsByGroupId = new Map(grouped.map((g) => [g.groupId, g]));

    const apiGroupsWithStats = apiGroups.map((group) => {
      const stats = statsByGroupId.get(group.id);
      return {
        ...group,
        apisCount: stats?.apis.length ?? 0,
        aggregateUptime: stats?.aggregateUptime ?? null,
        aggregateUptimeBars: stats?.aggregateUptimeBars ?? [],
      };
    });

    // Short TTL: aggregate uptime should reflect a ping shortly after it lands.
    void setCached(key, apiGroupsWithStats, 20);

    return NextResponse.json(apiGroupsWithStats);
  } catch (error) {
    console.error("Error fetching API groups:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch API groups" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = createApiGroupSchema.parse(await request.json());

    const apiGroup = await prisma.apiGroup.create({
      data: {
        name: body.name,
        description: body.description,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    await Promise.all([
      deleteCachedPattern(cacheKey("dashboard", "api-groups", userId, "*")),
      deleteCachedPattern(cacheKey("dashboard", "overview", userId, "*")),
    ]);

    return NextResponse.json({ success: true, apiGroup });
  } catch (error) {
    console.error("Error creating API group:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create API group" },
      { status: 500 },
    );
  }
}
