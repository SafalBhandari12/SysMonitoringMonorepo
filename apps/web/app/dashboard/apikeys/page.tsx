"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CreateApiKeys } from "@/components/dashboard/apiKeys/createApiKeys";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ApiKeyListItem = {
  id: string;
  name: string;
};

function ApiKeysPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const canCreate = Boolean(session?.user?.onboarded);
  const {
    data: apis,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", "api-keys"],
    queryFn: async () => {
      const response = await axios.get<ApiKeyListItem[]>(
        "/api/dashboard/api-keys",
      );

      return response.data;
    },
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoading) {
    return <ApiKeysPageSkeleton />;
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
          {error ? "Failed to load API keys." : "Unable to load API keys."}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Create and track the keys used to access monitored endpoints.
          </p>
        </div>
        <CreateApiKeys disabled={!canCreate} />
      </div>
      {apis.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {apis.map((api) => (
            <Card
              key={api.id}
              className="shadow-sm transition-colors hover:bg-muted/20"
            >
              <CardHeader>
                <CardTitle>{api.name}</CardTitle>
                <CardDescription>Active API key</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No API keys yet</CardTitle>
            <CardDescription>
              Generate a key to start authenticating API requests.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
