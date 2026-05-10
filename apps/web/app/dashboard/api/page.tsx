import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";
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

export default async function Api() {
  const apis = await fetchServerApi<ApiListItem[]>("/api/dashboard/apis");

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
