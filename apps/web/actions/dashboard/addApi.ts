"use server";

import { fetchServerApi } from "@/lib/server-api";

export default async function addApiAction(formData: FormData) {
  const name = formData.get("name") as string;
  const path = formData.get("path") as string;
  const method = formData.get("method") as string;
  const apiGroupId = formData.get("apiGroupId") as string;
  const headers = formData.get("headers") as string;
  const body = formData.get("body") as string;
  const pathParams = formData.get("pathParams") as string;
  const queryParams = formData.get("queryParams") as string;

  // Helper function to parse JSON safely
  const parseJson = (jsonString: string | null) => {
    if (!jsonString || jsonString.trim() === "") return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Invalid JSON:", e);
      return null;
    }
  };

  await fetchServerApi<{ success: boolean }>("/api/dashboard/apis", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name,
      path,
      method,
      apiGroupId,
      headers: parseJson(headers),
      body: parseJson(body),
      pathParams: parseJson(pathParams),
      queryParams: parseJson(queryParams),
    }),
  });
}
