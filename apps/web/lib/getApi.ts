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
  apiGroupId: string;
  apiGroup: { name: string };
};

type GroupedApiResponse = {
  groupId: string;
  groupName: string;
  apis: ApiWithUptime[];
  aggregateUptime: number | null;
  aggregateUptimeBars: UptimeEntry[];
}[];

export async function getApi(
  userId: string,
  days = 90,
  groupId?: string,
): Promise<GroupedApiResponse> {
  // Build last-N-days range
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const apis = await prisma.api.findMany({
    where: {
      apiGroup: { userId },
      ...(groupId && { apiGroupId: groupId }),
    },
    select: {
      id: true,
      name: true,
      apiGroupId: true,
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
    const existing = map.get(s.apiId)!.get(dkey) || { upCount: 0, totalCount: 0 };
    map
      .get(s.apiId)!
      .set(dkey, {
        upCount: existing.upCount + s.upCount,
        totalCount: existing.totalCount + s.totalCount,
      });
  }

  // Fetch today's live responses to populate the current day's bar in real-time
  const todayStart = end;
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const todayResponses =
    apiIds.length > 0
      ? await prisma.apiResponse.findMany({
          where: {
            apiId: { in: apiIds },
            createdAt: { gte: todayStart, lt: todayEnd },
          },
          select: {
            apiId: true,
            status: true,
          },
        })
      : [];

  const todayStatsMap = new Map<string, { upCount: number; totalCount: number }>();
  for (const r of todayResponses) {
    const existing = todayStatsMap.get(r.apiId) || { upCount: 0, totalCount: 0 };
    existing.totalCount += 1;
    if (r.status === "UP") {
      existing.upCount += 1;
    }
    todayStatsMap.set(r.apiId, existing);
  }

  // Inject today's live stats into the map
  const todayKey = formatDate(todayStart);
  for (const [apiId, counts] of todayStatsMap.entries()) {
    if (!map.has(apiId)) map.set(apiId, new Map());
    const existing = map.get(apiId)!.get(todayKey) || { upCount: 0, totalCount: 0 };
    map
      .get(apiId)!
      .set(todayKey, {
        upCount: existing.upCount + counts.upCount,
        totalCount: existing.totalCount + counts.totalCount,
      });
  }

  const apisWithUptime: ApiWithUptime[] = apis.map((a) => {
    const perApiMap = map.get(a.id) || new Map();
    const result: UptimeEntry[] = [];

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = formatDate(new Date(d));
      const stat = perApiMap.get(key);
      if (stat) {
        const up =
          stat.upCount > 0 && stat.totalCount > 0 ? stat.upCount === stat.totalCount : false;
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
      apiGroupId: a.apiGroupId,
      apiGroup: { name: a.apiGroup.name },
    };
  });

  // Group APIs by group id and calculate aggregates
  const groupsMap = new Map<
    string,
    { groupName: string; apis: ApiWithUptime[] }
  >();
  apisWithUptime.forEach((api) => {
    const gid = api.apiGroupId;
    if (!groupsMap.has(gid)) {
      groupsMap.set(gid, { groupName: api.apiGroup.name, apis: [] });
    }
    groupsMap.get(gid)!.apis.push(api);
  });

  const result: GroupedApiResponse = Array.from(groupsMap.entries()).map(
    ([groupId, { groupName, apis: groupApis }]) => {
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
        groupId,
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
