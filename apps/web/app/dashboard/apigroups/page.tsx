"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import CreateApiGroup from "@/components/dashboard/apiGroups/createApiGroup";
import UptimeBars from "@/components/dashboard/UptimeBars";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type UptimeEntry = {
  date: string;
  up: boolean;
  upCount: number;
  totalCount: number;
  hasData?: boolean;
};

type ApiGroupListItem = {
  id: string;
  name: string;
  description: string | null;
  apisCount: number;
  aggregateUptime: number | null;
  aggregateUptimeBars: UptimeEntry[];
};

function ApiGroupsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-full mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ApiGroup() {
  const { status } = useSession();
  const {
    data: apiGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", "api-groups", "withStats"],
    queryFn: async () => {
      const response = await axios.get<ApiGroupListItem[]>(
        "/api/dashboard/api-groups?withStats=true",
      );

      return response.data;
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return <ApiGroupsPageSkeleton />;
  }

  if (error || !apiGroups) {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">
          {error ? "Failed to load API groups." : "Unable to load API groups."}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">API Groups</h1>
          <p className="text-sm text-muted-foreground">
            Organize related APIs into focused monitoring groups.
          </p>
        </div>
        <CreateApiGroup />
      </div>
      {apiGroups.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No API groups yet</CardTitle>
            <CardDescription>
              Create a group before adding endpoints to monitor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {apiGroups.map((group) => {
            const hasApis = group.apisCount > 0;
            const isAllUp = (group.aggregateUptime ?? 100) >= 99;
            const StatusIcon = !hasApis
              ? Layers
              : isAllUp
                ? CheckCircle2
                : AlertCircle;
            const statusColor = !hasApis
              ? "text-muted-foreground"
              : isAllUp
                ? "text-emerald-500"
                : "text-amber-500";

            return (
              <Link key={group.id} href={`/dashboard/apigroups/${group.id}`}>
                <Card className="shadow-sm transition-colors hover:bg-muted/20 h-full">
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusIcon
                          className={`h-4 w-4 shrink-0 ${statusColor}`}
                        />
                        <CardTitle className="truncate">
                          {group.name}
                        </CardTitle>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {group.description || "No description added."}
                    </CardDescription>

                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {group.apisCount} API{group.apisCount !== 1 ? "s" : ""}
                      </span>
                      {hasApis && (
                        <span className="font-medium">
                          {(group.aggregateUptime ?? 0).toFixed(2)}% uptime
                        </span>
                      )}
                    </div>

                    {hasApis && group.aggregateUptimeBars.length > 0 ? (
                      <UptimeBars
                        days={30}
                        initialData={group.aggregateUptimeBars}
                        currentUptime={group.aggregateUptime}
                        cellHeight={22}
                        cellWidth={5}
                        maxRows={1}
                        showLabel={false}
                        showHeader={false}
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No monitoring data yet.
                      </div>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
