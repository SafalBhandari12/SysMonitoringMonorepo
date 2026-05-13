import { auth } from "@/auth";
import { CreateApiKeys } from "@/components/dashboard/apiKeys/createApiKeys";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";

type ApiKeyListItem = {
  id: string;
  name: string;
};

export default async function ApiKeysPage() {
  const session = await auth();
  const canCreate = Boolean(session?.user?.onboarded);
  const apis = await fetchServerApi<ApiKeyListItem[]>(
    "/api/dashboard/api-keys",
  );

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Create and track the keys used to access monitored endpoints.
          </p>
        </div>
        <CreateApiKeys disabled={!canCreate} />
      </div>
      {apis.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {apis.map((api) => (
            <Card
              key={api.id}
              className="shadow-sm transition-colors hover:bg-muted/20"
            >
              <CardHeader>
                <CardTitle>{api.name}</CardTitle>
                <CardDescription>Active API key</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle>No API keys yet</CardTitle>
            <CardDescription>
              Generate a key to start authenticating API requests.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
