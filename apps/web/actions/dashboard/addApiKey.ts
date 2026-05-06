"use server";

import { prisma } from "@/prisma";
import { createApiKeysSchema } from "@/schema/createApiKeys";
import { getUserId } from "@/lib/auth-utils";
import z from "zod";
import { generateApiKey, hashKey } from "@/app/utils/hash";

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
    const userId = await getUserId();
    const rawKey = generateApiKey();

    const hashedKey = hashKey(rawKey);

    await prisma.apiKey.create({
      data: {
        name,
        userId,
        key: hashedKey,
      },
    });
    return { success: true, rawKey };
  } catch (error) {
    return { success: false };
  }
}
