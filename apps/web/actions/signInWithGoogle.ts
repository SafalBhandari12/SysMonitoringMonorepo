"use server";

import { signIn } from "@/auth";

export default async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
