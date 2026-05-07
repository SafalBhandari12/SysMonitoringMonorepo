import { auth } from "@/auth";
import {
  DailyStatsChart,
  DashboardMetric,
  DashboardRegion,
} from "@/components/dashboard/DailyStatsChart";
import { CardSmall } from "@/components/dashboard/card";
import { TimeLine } from "@/components/dashboard/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";
import { incidentStatusEnum, regions } from "@/prisma/generated/prisma/enums";

type DashboardSearchParams = Promise<{
  region?: string | string[];
  metric?: string | string[];
}>;

type DashboardOverview = {
  filters: {
    metric: DashboardMetric;
    region: DashboardRegion;
  };
  stats: {
    apiGroupsCount: number;
    apisCount: number;
    incidentCount: number;
    p90: string | null;
    p99: string | null;
  };
  incidents: {
    title: string;
    regions: regions[];
    startTime: string;
    endTime: string | null;
    status: incidentStatusEnum;
  }[];
  dailyStatsChartData: {
    label: string;
    tick: string;
    value: number;
    fill: string;
  }[];
  hasDailyStats: boolean;
};

function toQueryString(params: {
  region?: string | string[];
  metric?: string | string[];
}) {
  const query = new URLSearchParams();
  const region = Array.isArray(params.region) ? params.region[0] : params.region;
  const metric = Array.isArray(params.metric) ? params.metric[0] : params.metric;

  if (region) query.set("region", region);
  if (metric) query.set("metric", metric);

  return query.toString();
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: DashboardSearchParams;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
  }

  const query = toQueryString(params);
  const overview = await fetchServerApi<DashboardOverview>(
    `/api/dashboard/overview${query ? `?${query}` : ""}`,
  );
  const incidents = overview.incidents.map((incident) => ({
    ...incident,
    startTime: new Date(incident.startTime),
    endTime: incident.endTime ? new Date(incident.endTime) : null,
  }));

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-normal">
          Global Fleet Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          {session.user?.name
            ? `Welcome, ${session.user.name}.`
            : "System overview."}{" "}
          Performance is aggregated from your monitored APIs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CardSmall
          title="Api Groups"
          value={`${overview.stats.apiGroupsCount}`}
        />
        <CardSmall title="Apis" value={`${overview.stats.apisCount}`} />
        <CardSmall
          title="Incidents"
          value={`${overview.stats.incidentCount}/${overview.stats.apisCount}`}
        />
        <CardSmall
          title="P90 Response Time"
          value={overview.stats.p90 ? `${overview.stats.p90} ms` : "N/A"}
        />
        <CardSmall
          title="P99 Response Time"
          value={overview.stats.p99 ? `${overview.stats.p99} ms` : "N/A"}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <DailyStatsChart
          data={overview.dailyStatsChartData}
          hasStats={overview.hasDailyStats}
          metric={overview.filters.metric}
          region={overview.filters.region}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-normal">
              Recent incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length > 0 ? (
              <TimeLine incidents={incidents} />
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
                <p className="text-sm font-medium">No recent incidents</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Resolved and active incidents will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
