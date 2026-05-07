"use server";

import { fetchServerApi } from "@/lib/server-api";

export default async function registerDomain(formData: FormData) {
  try {
    const domain = formData.get("domain") as string;

    await fetchServerApi<{ success: boolean }>("/api/onboarding/domain", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        domain,
      }),
    });
  } catch (error) {
    console.error("Error registering domain:", error);
  }
}
