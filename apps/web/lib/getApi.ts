import { prisma } from "@/prisma";

type UptimeEntry = {
  date: string;
  up: boolean;
  upCount: number;
  totalCount: number;
  hasData?: boolean;
};

type ApiWithUptime = {
  id: string;
  name: string;
  uptime: UptimeEntry[];
  currentUptime: number | null;
  apiGroup: { name: string };
};

type GroupedApiResponse = {
  groupName: string;
  apis: ApiWithUptime[];
  aggregateUptime: number | null;
  aggregateUptimeBars: UptimeEntry[];
}[];

export async function getApi(
  userId: string,
  days = 90,
): Promise<GroupedApiResponse> {
  // Build last-N-days range
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const apis = await prisma.api.findMany({
    where: { apiGroup: { userId } },
    select: {
      id: true,
      name: true,
      metrics: { select: { upCount: true, totalCount: true } },
      apiGroup: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
            api: { select: { apiGroup: { select: { name: true } } } },
          },
          orderBy: { date: "asc" },
        })
      : [];

  function formatDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

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

  const apisWithUptime: ApiWithUptime[] = apis.map((a) => {
    const perApiMap = map.get(a.id) || new Map();
    const result: UptimeEntry[] = [];

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
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
          hasData: true,
        });
      } else {
        result.push({
          date: key,
          up: false,
          upCount: 0,
          totalCount: 0,
          hasData: false,
        });
      }
    }

    // Calculate current uptime from all metrics across regions
    let currentUptime: number | null = null;
    if (a.metrics && a.metrics.length > 0) {
      const totalUp = a.metrics.reduce((sum, m) => sum + m.upCount, 0);
      const totalCount = a.metrics.reduce((sum, m) => sum + m.totalCount, 0);
      if (totalCount > 0) {
        currentUptime = (totalUp / totalCount) * 100;
      }
    }

    return {
      id: a.id,
      name: a.name,
      uptime: result,
      currentUptime,
      apiGroup: { name: a.apiGroup.name },
    };
  });

  // Group APIs by group name and calculate aggregates
  const groupsMap = new Map<string, ApiWithUptime[]>();
  apisWithUptime.forEach((api) => {
    const groupName = api.apiGroup.name;
    if (!groupsMap.has(groupName)) {
      groupsMap.set(groupName, []);
    }
    groupsMap.get(groupName)!.push(api);
  });

  const result: GroupedApiResponse = Array.from(groupsMap.entries()).map(
    ([groupName, groupApis]) => {
      // Calculate aggregate uptime (average of all child APIs)
      const aggregateUptime =
        groupApis.length > 0
          ? groupApis.reduce((sum, api) => sum + (api.currentUptime ?? 0), 0) /
            groupApis.length
          : null;

      // Calculate aggregate uptime bars from all child APIs' daily uptime
      const aggregateUptimeBars: UptimeEntry[] = Array.from(
        { length: days },
        (_, dayIndex) => {
          const dayUptimes = groupApis
            .map((api) => api.uptime[dayIndex])
            .filter((item) => item !== undefined);

          if (dayUptimes.length === 0) {
            return {
              date: "",
              up: false,
              upCount: 0,
              totalCount: 0,
              hasData: false,
            };
          }

          const totalUpCount = dayUptimes.reduce(
            (sum, item) => sum + item.upCount,
            0,
          );
          const totalCount = dayUptimes.reduce(
            (sum, item) => sum + item.totalCount,
            0,
          );
          const hasData = dayUptimes.some((item) => item.hasData);

          return {
            date: dayUptimes[0].date,
            up:
              totalUpCount > 0 &&
              totalCount > 0 &&
              totalUpCount >= dayUptimes.length / 2,
            upCount: totalUpCount,
            totalCount: totalCount,
            hasData,
          };
        },
      );

      return {
        groupName,
        apis: groupApis,
        aggregateUptime,
        aggregateUptimeBars,
      };
    },
  );

  return result;
}

export default getApi;
