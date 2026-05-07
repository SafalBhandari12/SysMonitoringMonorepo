"use server";

import { createApiKeysSchema } from "@/schema/createApiKeys";
import { fetchServerApi } from "@/lib/server-api";
import z from "zod";

export default async function addApiKeyAction(
  data: z.infer<typeof createApiKeysSchema>,
) {
  try {
    const parsedData = createApiKeysSchema.safeParse({
      name: data.name,
    });
    if (!parsedData.success) {
      throw new Error("Invalid form data");
    }
    const { name } = parsedData.data;
    const result = await fetchServerApi<{ success: true; rawKey: string }>(
      "/api/dashboard/api-keys",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

    return { success: true, rawKey: result.rawKey };
  } catch {
    return { success: false };
  }
}
