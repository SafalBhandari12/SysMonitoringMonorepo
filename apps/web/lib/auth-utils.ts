import { auth } from "@/auth";
import { signOut } from "next-auth/react";

export async function getUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    signOut({ callbackUrl: "/login" });
    throw new Error("User not authenticated");
  }

  return userId;
}
