"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function DomainVerificationButton() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/onboarding/domain/verify", {
        method: "POST",
      });

      const payload = (await response.json()) as {
        success?: boolean;
        verified?: boolean;
        error?: string;
      };

      if (response.ok && payload.verified) {
        toast.success("Domain verified", {
          description: "Your session is being refreshed.",
        });
        router.replace("/login");
        return;
      }

      toast.error("Verification failed", {
        description:
          payload.error ??
          "The DNS record or meta tag is not live yet. Try again after propagation.",
      });
    } catch {
      toast.error("Verification failed", {
        description: "Unable to reach the verification endpoint.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Button
      onClick={handleVerify}
      disabled={isVerifying}
      className="w-full sm:w-auto"
    >
      {isVerifying ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <ShieldCheck className="size-4" />
          Verify domain
        </>
      )}
    </Button>
  );
}
