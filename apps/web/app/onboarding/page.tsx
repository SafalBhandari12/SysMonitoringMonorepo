import { OnboardingClient } from "@/components/onboarding/OnboardingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - API Monitor",
  description: "Set up your organization.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
