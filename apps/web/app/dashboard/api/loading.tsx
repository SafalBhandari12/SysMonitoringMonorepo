import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function loadingApi() {
  return (
    <div className="flex flex-col gap-8 px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Stats Bar - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-muted/30 to-muted/50"
          >
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API List - Vertical Cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="border border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
              {/* Method Badge & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Skeleton className="h-6 w-12 rounded-md" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-56 max-w-full" />
                  </div>
                </div>
              </div>

              {/* Uptime Bars */}
              <div className="flex-1 min-w-0">
                <div className="flex gap-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1 rounded-sm" />
                  ))}
                </div>
              </div>

              {/* Percentage */}
              <div className="text-right">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
