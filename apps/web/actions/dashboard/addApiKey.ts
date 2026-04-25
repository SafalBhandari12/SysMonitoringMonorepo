"use server";

import { prisma } from "@/prisma";
import { createApiKeysSchema } from "@/schema/createApiKeys";
import { getUserId } from "@/lib/auth-utils";
import crypto from "crypto";
import z, { success } from "zod";
import { CreateAxiosDefaults } from "axios";

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
    const rawKey = crypto.randomBytes(32).toString("hex");

    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

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
