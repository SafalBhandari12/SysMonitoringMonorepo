"use server";

import { signOut } from "@/auth";
import { getUserId } from "@/lib/auth-utils";
import verifyDomain from "@/lib/onboarding/verifyDomain";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function verifyDomainAction(formData: FormData) {
  const userId = await getUserId();
  const domainRecord = await prisma.domain.findFirst({
    where: {
      userId,
    },
  });
  if (!domainRecord) {
    return;
  }
  const isVerified = await verifyDomain(
    domainRecord?.domain,
    domainRecord?.verificationCode,
    "BOTH",
  );
  if (isVerified) {
    await prisma.domain.update({
      where: {
        id: domainRecord?.id,
      },
      data: {
        verificationStatus: "VERIFIED",
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
      },
    });
    await signOut();
    redirect("/login");
  }
}
