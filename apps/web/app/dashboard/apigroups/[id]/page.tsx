export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUserId } from "@/lib/auth-utils";
import { getApi } from "@/lib/getApi";
import { prisma } from "@/prisma";
import { incidentStatusEnum, regions } from "@/prisma/generated/prisma/enums";
import ApisByGroup from "@/components/dashboard/ApisByGroup";
import { TimeLine } from "@/components/dashboard/Timeline";
import { CardSmall } from "@/components/dashboard/card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApiGroupDetailPage(props: PageProps) {
  const { id: groupId } = await props.params;
  const userId = await getUserId();

  const group = await prisma.apiGroup.findUnique({
    where: { id: groupId },
    select: { id: true, name: true, description: true, userId: true },
  });

  // 404 for both "doesn't exist" and "belongs to someone else" so we don't
  // leak whether a given group id exists.
  if (!group || group.userId !== userId) {
    notFound();
  }

  const [groupedApis, rawIncidents] = await Promise.all([
    getApi(userId, 90, groupId),
    prisma.incident.findMany({
      where: { api: { apiGroupId: groupId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        title: true,
        regions: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    }),
  ]);

  // getApi is filtered to this single group, so there's at most one entry.
  const groupData = groupedApis[0];

  const incidents = rawIncidents.map((incident) => ({
    title: incident.title,
    regions: incident.regions as unknown as regions[],
    status: incident.status as incidentStatusEnum,
    startTime: incident.startTime,
    endTime: incident.endTime,
  }));

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-muted-foreground"
        >
          <Link href="/dashboard/apigroups">
            <ArrowLeft className="h-4 w-4" />
            Back to API Groups
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-normal">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            {group.description || "No description added."}
          </p>
        </div>
      </div>

      {!groupData || groupData.apis.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No APIs in this group yet</CardTitle>
            <CardDescription>
              Add an endpoint and assign it to &quot;{group.name}&quot; to
              start seeing charts here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <CardSmall title="Endpoints" value={`${groupData.apis.length}`} />
            <CardSmall
              title="Aggregate uptime (90d)"
              value={`${(groupData.aggregateUptime ?? 0).toFixed(2)}%`}
            />
            <CardSmall
              title="Recent incidents"
              value={`${incidents.length}`}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <ApisByGroup groupedApis={[groupData]} />
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
        </>
      )}
    </div>
  );
}
