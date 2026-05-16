"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function onboardUserAction(organizationName: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!organizationName || organizationName.trim().length === 0) {
    return { success: false, error: "Organization name is required" };
  }

  try {
    // Check if organization name is unique across all users
    const existing = await prisma.user.findFirst({
      where: {
        organizationName: organizationName.trim(),
        id: { not: session.user.id },
      },
    });

    if (existing) {
      return { success: false, error: "Organization name is already taken" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboarded: true,
        organizationName: organizationName.trim(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error onboarding user:", error);
    return { success: false, error: "Failed to save organization name" };
  }
}
