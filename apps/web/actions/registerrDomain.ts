"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";

export default async function registerDomain(formData: FormData) {
  try {
    const domain = formData.get("domain") as string;
    console.log("Registering domain:", domain);
    const data = await auth();
    const userId = data?.user?.id;
    console.log("User ID:", userId);
    await prisma.domain.create({
      data: {
        domain,
        userId: userId!,
      },
    });
  } catch (error) {
    console.error("Error registering domain:", error);
  }
}
