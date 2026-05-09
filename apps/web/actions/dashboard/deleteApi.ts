"use server";

import { fetchServerApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

export async function deleteApiAction(apiId: string) {
  try {
    const response = await fetchServerApi<{ success: boolean }>(
      `/api/dashboard/apis/${apiId}`,
      {
        method: "DELETE",
      },
    );

    // Revalidate the dashboard page to refresh the data
    revalidatePath("/dashboard");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting API:", error);
    throw error;
  }
}
