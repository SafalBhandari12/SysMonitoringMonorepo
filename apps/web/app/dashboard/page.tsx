import { auth } from "@/auth";

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
    <div className="flex h-screen items-center justify-center">
      {session.user?.name && (
        <p className="text-xl">Welcome, {session.user.name}!</p>
      )}
      <h1 className="text-4xl font-bold">Dashboard</h1>
    </div>
  );
}
