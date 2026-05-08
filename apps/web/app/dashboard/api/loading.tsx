import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function loadingApi() {
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
