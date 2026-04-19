import { auth } from "@/auth";

export default async function Api() {
  const user = await auth();
  return (
    <div className="h-screen items-center justify-center pl-6 pt-5">
      <h1 className="text-4xl font-bold">API</h1>
    </div>
  );
}
