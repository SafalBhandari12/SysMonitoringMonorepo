"use client";

import { useEffect, useState } from "react";

import {
  ApiStatusTable,
  ApiStatusTableSkeleton,
} from "@/components/dashboard/ApiStatusTable";
import { RegionSelect } from "@/components/dashboard/RegionSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApiStatusOverviewProps = {
  region: string;
  apis: {
    id: string;
    name: string;
    status: "UP" | "DOWN";
    uptime: number | null;
    p90: number | null;
    p99: number | null;
  }[];
};

export function ApiStatusOverview({ region, apis }: ApiStatusOverviewProps) {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(false);
  }, [region]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-semibold uppercase tracking-normal">
          Api status overview
        </CardTitle>
        <RegionSelect value={region} onPendingChange={setIsPending} />
      </CardHeader>
      <CardContent>
        {isPending ? (
          <ApiStatusTableSkeleton />
        ) : (
          <ApiStatusTable apis={apis} />
        )}
      </CardContent>
    </Card>
  );
}
