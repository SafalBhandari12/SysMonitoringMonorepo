import DomainRegistration from "@/components/onboarding/domainRegistration";
import DomainVerification from "@/components/onboarding/domainVerificationInstructions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchServerApi } from "@/lib/server-api";

type OnboardingDomain = {
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  verificationCode: string;
} | null;

export default async function Onboarding() {
  const userDetails = await auth();

  if (userDetails?.user?.onboarded) {
    redirect("/dashboard");
  }

  const domain = await fetchServerApi<OnboardingDomain>(
    "/api/onboarding/domain",
  );

  if (!domain) {
    return <DomainRegistration />;
  }
  if (
    domain.verificationStatus === "VERIFIED" &&
    !userDetails?.user?.onboarded
  ) {
    redirect("/login");
  }

  return <DomainVerification userId={userDetails?.user?.id ?? ""} domain={domain} />;
}
