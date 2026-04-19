import { auth } from "@/auth";
import DomainRegistration from "@/components/onboarding/domainRegistration";
import DomainVerification from "@/components/onboarding/domainVerificationInstructions";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function Onboarding() {
  const userDetails = await auth();
  const userId = userDetails!.user?.id!;

  if (userDetails?.user?.onboarded) {
    redirect("/dashboard");
  }

  const domain = await prisma.domain.findFirst({
    where: {
      userId,
    },
  });

  if (!domain) {
    return <DomainRegistration />;
  }
  if (
    domain.verificationStatus === "VERIFIED" &&
    !userDetails?.user?.onboarded
  ) {
    redirect("/login");
  }

  return <DomainVerification userId={userId} domain={domain} />;
}
