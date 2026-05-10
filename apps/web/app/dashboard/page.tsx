import { auth } from "@/auth";
import { CardSmall } from "@/components/dashboard/card";
import { ApiStatusTable } from "@/components/dashboard/ApiStatusTable";
import { TimeLine } from "@/components/dashboard/Timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";
import { incidentStatusEnum, regions } from "@/prisma/generated/prisma/enums";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateButton from "@/components/reui/createButton";

type DashboardOverview = {
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
  apis: {
    id: string;
    name: string;
    apiGroupName: string;
    status: "UP" | "DOWN";
    uptime: number | null;
    p90: number | null;
    p99: number | null;
  }[];
  availableGroups: {
    id: string;
    name: string;
  }[];
};

export default async function Dashboard({}: {}) {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
  }

  const overview = await fetchServerApi<DashboardOverview>(
    `/api/dashboard/overview`,
  );
  const incidents = overview.incidents.map((incident) => ({
    ...incident,
    startTime: new Date(incident.startTime),
    endTime: incident.endTime ? new Date(incident.endTime) : null,
  }));

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex justify-between">
          <h1 className="text-3xl font-semibold tracking-normal">
            Global Fleet Overview
          </h1>
          <CreateButton href="/dashboard/api/create" text="Create API" />
        </div>
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

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-normal">
              Api status overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApiStatusTable
              initialApis={overview.apis}
              availableGroups={overview.availableGroups}
            />
          </CardContent>
        </Card>
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
