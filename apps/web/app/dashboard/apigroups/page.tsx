"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import CreateApiGroup from "@/components/dashboard/apiGroups/createApiGroup";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ApiGroupListItem = {
  id: string;
  name: string;
  description: string | null;
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
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ApiGroup() {
  const { data: session, status } = useSession();
  const canCreate = Boolean(session?.user?.onboarded);
  const {
    data: apiGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", "api-groups"],
    queryFn: async () => {
      const response = await axios.get<ApiGroupListItem[]>(
        "/api/dashboard/api-groups",
      );

      return response.data;
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return <ApiGroupsPageSkeleton />;
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
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
        <CreateApiGroup disabled={!canCreate} />
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
          {apiGroups.map((group) => (
            <Card
              key={group.id}
              className="shadow-sm transition-colors hover:bg-muted/20"
            >
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.description || "No description added."}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
