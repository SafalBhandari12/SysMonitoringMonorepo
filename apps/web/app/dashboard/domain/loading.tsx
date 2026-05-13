import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DomainLoading() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="shadow-sm">
          <CardHeader className="gap-3 border-b border-border/60 pb-5">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-7 w-56 max-w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-3/4 max-w-xl" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <div className="space-y-5">
              <Skeleton className="h-5 w-28" />
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-36 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />

            <div className="space-y-4 border-t pt-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}