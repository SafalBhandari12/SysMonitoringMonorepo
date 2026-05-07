import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";
import { regions } from "@/prisma/generated/prisma/enums";
import { TDigest } from "tdigest";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dashboardSearchParamsSchema = z.object({
  metric: z.enum(["p90", "p99", "uptime"]).catch("p90"),
  region: z
    .preprocess((value) => String(value ?? "IN").toUpperCase(), z.enum(["IN", "KR"]))
    .catch("IN"),
});

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatChartLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function buildDailyStatsChartData(
  stats: {
    date: Date;
    upCount: number;
    totalCount: number;
    p90ResponseTime: number;
    p99ResponseTime: number;
  }[],
  metric: "p90" | "p99" | "uptime",
) {
  const today = new Date();
  const startDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  startDate.setUTCDate(startDate.getUTCDate() - 89);

  const buckets = new Map<
    string,
    {
      upCount: number;
      totalCount: number;
      p90Weighted: number;
      p99Weighted: number;
      latencyWeight: number;
    }
  >();

  for (const stat of stats) {
    const key = dayKey(stat.date);
    const bucket = buckets.get(key) ?? {
      upCount: 0,
      totalCount: 0,
      p90Weighted: 0,
      p99Weighted: 0,
      latencyWeight: 0,
    };
    const weight = Math.max(stat.totalCount, 1);

    bucket.upCount += stat.upCount;
    bucket.totalCount += stat.totalCount;
    bucket.p90Weighted += stat.p90ResponseTime * weight;
    bucket.p99Weighted += stat.p99ResponseTime * weight;
    bucket.latencyWeight += weight;
    buckets.set(key, bucket);
  }

  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);

    const bucket = buckets.get(dayKey(date));
    const value =
      metric === "uptime"
        ? bucket?.totalCount
          ? (bucket.upCount / bucket.totalCount) * 100
          : 0
        : bucket?.latencyWeight
          ? metric === "p90"
            ? bucket.p90Weighted / bucket.latencyWeight
            : bucket.p99Weighted / bucket.latencyWeight
          : 0;

    return {
      label: dayKey(date),
      tick:
        index === 0
          ? "90D AGO"
          : index === 44
            ? formatChartLabel(date)
            : index === 89
              ? "CURRENT"
              : "",
      value: Number(value.toFixed(metric === "uptime" ? 2 : 0)),
      fill: index >= 58 && index <= 70 ? "#707070" : "#d9d9d9",
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { metric, region } = dashboardSearchParamsSchema.parse({
      metric: request.nextUrl.searchParams.get("metric") ?? undefined,
      region: request.nextUrl.searchParams.get("region") ?? undefined,
    });
    const prismaRegion = region === "KR" ? regions.SG : regions.IN;
    const since = new Date();
    since.setDate(since.getDate() - 90);

    const [
      apiGroupsCount,
      apisCount,
      incident,
      apiDigests,
      dailyStats,
    ] = await Promise.all([
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
      prisma.dailyStats.findMany({
        where: {
          date: {
            gte: since,
          },
          region: prismaRegion,
          api: {
            apiGroup: {
              userId,
            },
          },
        },
        select: {
          date: true,
          upCount: true,
          totalCount: true,
          p90ResponseTime: true,
          p99ResponseTime: true,
        },
        orderBy: {
          date: "asc",
        },
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

    return NextResponse.json({
      filters: {
        metric,
        region,
      },
      stats: {
        apiGroupsCount,
        apisCount,
        incidentCount: incident.length,
        p90,
        p99,
      },
      incidents: incident,
      dailyStatsChartData: buildDailyStatsChartData(dailyStats, metric),
      hasDailyStats: dailyStats.length > 0,
    });
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
