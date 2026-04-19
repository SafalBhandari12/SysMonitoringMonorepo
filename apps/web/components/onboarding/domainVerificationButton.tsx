"use client";

import verifyDomainAction from "@/actions/verifyDomain";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Verifying..." : "Verify Domain"}
    </button>
  );
}

export default function DomainVerificationButton() {
  return (
    <form action={verifyDomainAction}>
      <p>
        Click the button below to verify your domain ownership. This will check
        both the DNS record and the meta tag for the verification code.
      </p>
      <SubmitButton />
    </form>
  );
}
