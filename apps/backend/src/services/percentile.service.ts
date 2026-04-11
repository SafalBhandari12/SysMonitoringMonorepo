import prisma from "@repo/db/client";

class PercentileService {
  static async calculatePercentiles(apiId: string) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all regions that have responses for this API
    const regions = await prisma.apiResponse.findMany({
      where: {
        apiId,
        createdAt: {
          gte: ninetyDaysAgo,
        },
      },
      distinct: ["region"],
      select: {
        region: true,
      },
    });

    if (regions.length === 0) {
      console.log(`No responses found for API ${apiId} in last 90 days`);
      return;
    }

    // Calculate percentiles per region
    for (const { region } of regions) {
      const result = await prisma.$queryRaw<
        Array<{
          p99: number;
          p90: number;
          avg: number;
        }>
      >`
        SELECT 
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "responseTime") as p99,
          PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY "responseTime") as p90,
          AVG("responseTime") as avg
        FROM "ApiResponse"
        WHERE "apiId" = ${apiId} 
          AND "region" = ${region}
          AND "createdAt" >= ${ninetyDaysAgo}
      `;

      if (
        !result ||
        result.length === 0 ||
        !result[0] ||
        result[0].p99 === null
      ) {
        console.log(`No responses found for API ${apiId} in region ${region}`);
        continue;
      }

      const { p99, p90, avg } = result[0];

      // Upsert metrics per region
      await prisma.apiMetrics.upsert({
        where: {
          apiId_region: {
            apiId,
            region,
          },
        },
        create: {
          apiId,
          region,
          p99ResponseTime: Math.round(p99),
          p90ResponseTime: Math.round(p90),
          averageResponseTime: Math.round(avg),
        },
        update: {
          p99ResponseTime: Math.round(p99),
          p90ResponseTime: Math.round(p90),
          averageResponseTime: Math.round(avg),
        },
      });

      console.log(
        `Percentiles calculated for API ${apiId} in region ${region}: P99=${Math.round(p99)}, P90=${Math.round(p90)}, Avg=${Math.round(avg)}`,
      );
    }
  }

  static async calculatePercentilesForDomain(domainId: string) {
    const apis = await prisma.api.findMany({
      where: {
        domainId,
      },
      select: {
        id: true,
      },
    });

    await Promise.all(apis.map((api) => this.calculatePercentiles(api.id)));

    console.log(
      `Percentiles calculated for all ${apis.length} APIs in domain ${domainId}`,
    );
  }
}

export default PercentileService;
