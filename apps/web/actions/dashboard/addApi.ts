"use server";

import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";

export default async function addApiAction(formData: FormData) {
  const userId = await getUserId();

  const name = formData.get("name") as string;
  const path = formData.get("path") as string;
  const method = formData.get("method") as string;
  const apiGroupId = formData.get("apiGroupId") as string;
  const headers = formData.get("headers") as string;
  const body = formData.get("body") as string;
  const pathParams = formData.get("pathParams") as string;
  const queryParams = formData.get("queryParams") as string;

  const domain = await prisma.domain.findFirst({
    where: {
      userId,
    },
  });

  if (!domain) {
    throw new Error("No domain found for user");
  }

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

  await prisma.api.create({
    data: {
      name,
      path,
      method: method as any,
      domainId: domain.id,
      apiGroupId,
      headers: parseJson(headers),
      body: parseJson(body),
      pathParams: parseJson(pathParams),
      queryParams: parseJson(queryParams),
    },
  });
}
