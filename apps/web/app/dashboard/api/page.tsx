import { getUserId } from "@/lib/auth-utils";
import CreateApi from "@/components/dashboard/api/createApi";
import { prisma } from "@/prisma";

export default async function Api() {
  const userId = await getUserId();
  const apis = await prisma.api.findMany({
    where: {
      domain: {
        userId,
      },
    },
  });
  console.log("APIs for user:", apis);
  return (
    <div className="flex h-screen flex-col gap-4 pl-6 pt-5">
      <h1 className="text-4xl font-bold">API</h1>
      {apis.length === 0 ? (
        <p className="text-gray-500">
          No APIs found. Please add a domain and create an API.
        </p>
      ) : (
        <ul className="space-y-2">
          {apis.map((api) => (
            <li key={api.id} className="border-b border-gray-300 pb-2">
              <h2 className="text-xl font-semibold">{api.name}</h2>
              <p className="text-gray-600">
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
