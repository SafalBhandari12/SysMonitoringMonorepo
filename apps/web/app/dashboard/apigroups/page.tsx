import { auth } from "@/auth";
import CreateApiGroup from "@/components/dashboard/apiGroups/createApiGroup";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";

type ApiGroupListItem = {
  id: string;
  name: string;
  description: string | null;
};

export default async function ApiGroup() {
  const session = await auth();
  const canCreate = Boolean(session?.user?.onboarded);
  const apiGroups = await fetchServerApi<ApiGroupListItem[]>(
    "/api/dashboard/api-groups",
  );

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">API Groups</h1>
          <p className="text-sm text-muted-foreground">
            Organize related APIs into focused monitoring groups.
          </p>
        </div>
        <CreateApiGroup disabled={!canCreate} />
      </div>
      {apiGroups.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No API groups yet</CardTitle>
            <CardDescription>
              Create a group before adding endpoints to monitor.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {apiGroups.map((group) => (
            <Card
              key={group.id}
              className="shadow-sm transition-colors hover:bg-muted/20"
            >
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.description || "No description added."}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
