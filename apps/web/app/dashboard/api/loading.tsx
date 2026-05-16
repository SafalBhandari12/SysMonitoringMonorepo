import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingApi() {
  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-32" /> {/* APIs title */}
          <Skeleton className="h-5 w-64" /> {/* description */}
        </div>
        <Skeleton className="h-9 w-40 rounded-md" /> {/* Status Page Button */}
      </div>

      {/* Content Skeleton (mimicking ApisByGroup) */}
      <Card className="shadow-sm overflow-hidden bg-card border">
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col border-b last:border-b-0">
              <div className="px-4 py-3 flex flex-col gap-2">
                {/* Top row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon */}
                    <Skeleton className="h-5 w-32" /> {/* Group name */}
                    <div className="flex items-center gap-2 ml-3">
                      <Skeleton className="h-4 w-24" /> {/* Components count */}
                      <Skeleton className="h-4 w-4 rounded-sm" /> {/* Chevron */}
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" /> {/* Uptime % */}
                </div>

                {/* Uptime Bars Skeleton (mimicking UptimeBars) */}
                <div className="hidden sm:flex flex-wrap items-center justify-between gap-[1px] w-full pt-1">
                  {Array.from({ length: 90 }).map((_, j) => (
                    <Skeleton 
                      key={j} 
                      className="h-[18px] rounded-sm opacity-60" 
                      style={{ 
                        width: 6, 
                        flex: '0 1 6px',
                        minWidth: 2
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
