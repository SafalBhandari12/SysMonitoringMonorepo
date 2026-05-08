import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiStatusTableSkeleton } from "@/components/dashboard/ApiStatusTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-130 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} size="default" className="gap-2 px-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                <Skeleton className="h-3 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-1">
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="shadow-sm">
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </CardHeader>
          <CardContent>
            <ApiStatusTableSkeleton />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-normal">
              <Skeleton className="h-4 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
