import CreateApi from "@/components/dashboard/api/createApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";
import { methodEnum } from "@/prisma/generated/prisma/enums";

type ApiListItem = {
  id: string;
  name: string;
  method: methodEnum;
  path: string;
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
        <CreateApi />
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {apis.map((api) => (
            <Card key={api.id} className="shadow-sm transition-colors hover:bg-muted/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="truncate">{api.name}</CardTitle>
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                    {api.method}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <code className="break-all rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                  {api.path}
                </code>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
