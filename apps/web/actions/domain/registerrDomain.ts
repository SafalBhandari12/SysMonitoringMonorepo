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

    return { success: true as const };
  } catch (error) {
    console.error("Error registering domain:", error);

    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to register domain.",
    };
  }
}
