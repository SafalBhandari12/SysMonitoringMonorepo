"use server";

import { fetchServerApi } from "@/lib/server-api";
import { redirect } from "next/navigation";

export default async function verifyDomainAction() {
  const result = await fetchServerApi<{ success: boolean; verified: boolean }>(
    "/api/onboarding/domain/verify",
    {
      method: "POST",
    },
  );

  if (result.verified) {
    redirect("/login");
  }
}
