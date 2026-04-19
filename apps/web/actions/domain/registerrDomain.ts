"use server";

import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";

export default async function registerDomain(formData: FormData) {
  try {
    const domain = formData.get("domain") as string;
    console.log("Registering domain:", domain);
    const userId = await getUserId();
    console.log("User ID:", userId);
    await prisma.domain.create({
      data: {
        domain,
        userId,
      },
    });
  } catch (error) {
    console.error("Error registering domain:", error);
  }
}
