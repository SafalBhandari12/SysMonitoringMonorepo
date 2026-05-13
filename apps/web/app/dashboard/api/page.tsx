"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { methodEnum } from "@/prisma/generated/prisma/enums";
// UptimeBars is a client component; import directly so Next handles it correctly
import UptimeBars from "../../../components/dashboard/UptimeBars";

type ApiListItem = {
  id: string;
  name: string;
  method: methodEnum;
  path: string;
  uptime?: { date: string; up: boolean; upCount: number; totalCount: number }[];
};

function ApiPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Api() {
  const { status } = useSession();
  const {
    data: apis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", "apis"],
    queryFn: async () => {
      const response = await axios.get<ApiListItem[]>("/api/dashboard/apis");

      return response.data;
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return <ApiPageSkeleton />;
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
  }

  if (error || !apis) {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">
          {error ? "Failed to load APIs." : "Unable to load APIs."}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">APIs</h1>
          <p className="text-sm text-muted-foreground">
            Monitor endpoint paths, methods, and group assignments.
          </p>
        </div>
      </div>
      {apis.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No APIs yet</CardTitle>
            <CardDescription>
              Create your first endpoint after adding an API group.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {apis.map((api) => (
            <Card
              key={api.id}
              className="shadow-sm rounded-none transition-colors hover:bg-muted/20 w-full flex flex-row items-center justify-between"
            >
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="truncate flex gap-1 align-middle items-center">
                      {api.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-full">
                  <UptimeBars
                    method={api.method}
                    path={api.path}
                    days={90}
                    initialData={api.uptime}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
