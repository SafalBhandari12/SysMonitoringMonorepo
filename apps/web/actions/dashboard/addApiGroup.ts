"use server";

import { fetchServerApi } from "@/lib/server-api";

export default async function addApiGroupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | undefined;

  await fetchServerApi<{ success: boolean }>("/api/dashboard/api-groups", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });
}
