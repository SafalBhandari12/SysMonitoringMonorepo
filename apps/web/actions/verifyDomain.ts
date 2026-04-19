"use server";

import { auth, signOut } from "@/auth";
import verifyDomain from "@/lib/onboarding/verifyDomain";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function verifyDomainAction(formData: FormData) {
  const domain = await auth();
  const userId = domain?.user?.id!;
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
