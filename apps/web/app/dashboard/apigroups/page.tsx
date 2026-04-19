import { getUserId } from "@/lib/auth-utils";
import CreateApiGroup from "@/components/dashboard/apiGroups/createApiGroup";
import { prisma } from "@/prisma";

export default async function ApiGroup() {
  const userId = await getUserId();

  const apiGroups = await prisma.apiGroup.findMany({
    where: {
      userId,
    },
  });
  console.log("API Groups:", apiGroups);
  return (
    <div className="flex h-screen  flex-col gap-4 pl-6 pt-5">
      <h1 className="text-4xl font-bold">API Group</h1>
      {apiGroups.length === 0 ? (
        <p className="text-gray-500">No API groups found. Create one below.</p>
      ) : (
        <ul className="space-y-2">
          {apiGroups.map((group) => (
            <li key={group.id} className="border-b border-gray-300 pb-2">
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-gray-600">{group.description}</p>
            </li>
          ))}
        </ul>
      )}
      <CreateApiGroup />
    </div>
  );
}
