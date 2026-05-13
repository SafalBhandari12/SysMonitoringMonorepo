import { redirect } from "next/navigation";

import DomainRegistration from "@/components/onboarding/domainRegistration";
import DomainVerification from "@/components/onboarding/domainVerificationInstructions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchServerApi } from "@/lib/server-api";

type DashboardDomain = {
  domain: string;
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
  verificationCode: string;
} | null;

export default async function DomainPage() {
  const domain = await fetchServerApi<DashboardDomain>("/api/onboarding/domain");

  if (domain?.verificationStatus === "VERIFIED") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-normal">Domain</h1>
        <p className="text-sm text-muted-foreground">
          Add your domain, verify ownership, or fix a mistaken domain before it
          is verified.
        </p>
      </div>

      {!domain ? (
        <DomainRegistration
          redirectTo="/dashboard/domain"
          title="Add your domain"
          submitLabel="Add domain"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <DomainVerification
            userId=""
            domain={domain}
            redirectTo="/dashboard"
          />
          <Card className="h-fit shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Current domain</CardTitle>
                <Badge variant="secondary">{domain.verificationStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 font-mono text-sm">
                {domain.domain}
              </div>
              <p className="text-sm text-muted-foreground">
                You can change this domain while it is unverified. Once it is
                verified, the domain is locked.
              </p>
              <DomainRegistration
                initialDomain={domain.domain}
                redirectTo="/dashboard/domain"
                title="Change domain"
                submitLabel="Save domain"
                variant="inline"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
