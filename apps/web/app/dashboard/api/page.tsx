import CreateApi from "@/components/dashboard/api/createApi";
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
    <div className="flex flex-col gap-4 pl-6 py-5">
      <h1 className="text-4xl font-bold">API</h1>
      {apis.length === 0 ? (
        <p className="text-primary">
          No APIs found. Please add a domain and create an API.
        </p>
      ) : (
        <ul className="space-y-2">
          {apis.map((api) => (
            <li key={api.id} className="border-b border-border pb-2">
              <h2 className="text-xl font-semibold">{api.name}</h2>
              <p className="text-primary">
                {api.method} {api.path}
              </p>
            </li>
          ))}
        </ul>
      )}
      <CreateApi />
    </div>
  );
}
