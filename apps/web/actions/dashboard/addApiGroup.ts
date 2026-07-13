"use server";

import { fetchServerApi } from "@/lib/server-api";

export interface AddApiGroupResult {
  success?: boolean;
  error?: string;
  apiGroup?: { id: string; name: string; description: string | null };
}

export default async function addApiGroupAction(
  formData: FormData,
): Promise<AddApiGroupResult> {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | undefined;

  try {
    const result = await fetchServerApi<{
      success: boolean;
      apiGroup: { id: string; name: string; description: string | null };
    }>("/api/dashboard/api-groups", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    return { success: true, apiGroup: result.apiGroup };
  } catch (error: any) {
    return { error: error?.message || "Failed to create API group" };
  }
}
