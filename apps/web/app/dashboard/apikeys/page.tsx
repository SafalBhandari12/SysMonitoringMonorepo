import { CreateApiKeys } from "@/components/dashboard/apiKeys/createApiKeys";
import { fetchServerApi } from "@/lib/server-api";

type ApiKeyListItem = {
  id: string;
  name: string;
};

export default async function ApiKeysPage() {
  const apis = await fetchServerApi<ApiKeyListItem[]>(
    "/api/dashboard/api-keys",
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>
      <p>Manage your API keys here.</p>
      <CreateApiKeys />
      {apis.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your API Keys</h2>
          <ul className="space-y-2">
            {apis.map((api) => (
              <li key={api.id} className="flex items-center justify-between">
                <span>{api.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
