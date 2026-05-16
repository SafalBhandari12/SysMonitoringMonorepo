"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function onboardUserAction(organizationName: string, organizationUrl: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const validationResult = onboardingSchema.safeParse({ organizationName, organizationUrl });

  if (!validationResult.success) {
    return { 
      success: false, 
      error: validationResult.error.issues[0].message 
    };
  }

  const { organizationName: validName, organizationUrl: validUrl } = validationResult.data;

  try {
    // Check if organization URL is unique
    const existing = await prisma.user.findFirst({
      where: {
        organizationUrl: validUrl,
        id: { not: session.user.id },
      },
    });

    if (existing) {
      return { success: false, error: "This URL slug is already taken" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboarded: true,
        organizationName: validName,
        organizationUrl: validUrl,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error onboarding user:", error);
    return { success: false, error: "Failed to save organization" };
  }
}
