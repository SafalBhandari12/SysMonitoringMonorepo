import { auth } from "@/auth";
import { CardSmall } from "@/components/dashboard/card";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
  }
  return (
    <div className="h-screen">
      {session.user?.name && (
        <p className="text-xl">Welcome, {session.user.name}!</p>
      )}
      <div className="flex gap-4">
        <CardSmall title="Api" value="10" />
        <CardSmall title="Api" value="10" />
        <CardSmall title="Api" value="10" />
        <CardSmall title="Api" value="10" />
      </div>
      <h1 className="text-4xl font-bold">Dashboard</h1>
    </div>
  );
}
