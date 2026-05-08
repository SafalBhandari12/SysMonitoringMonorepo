import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function loadingApiKeys() {
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
