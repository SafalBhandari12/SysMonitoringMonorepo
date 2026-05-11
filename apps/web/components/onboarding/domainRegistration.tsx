"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import registerDomain from "@/actions/domain/registerrDomain";
import { useRouter } from "next/navigation";

export default function DomainRegistration() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const validateDomain = (value: string) => {
    setError("");

    if (value.includes("http://") || value.includes("https://")) {
      setError(
        "Protocol (http:// or https://) is not allowed. Enter domain only.",
      );
      return false;
    }

    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (value && !domainRegex.test(value)) {
      setError("Invalid domain format. Use format: example.com/example.net");
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomain(value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");

    if (!domain) {
      setError("Enter a domain to continue.");
      setPending(false);
      return;
    }

    if (!validateDomain(domain)) {
      setPending(false);
      return;
    }

    const formData = new FormData();
    formData.append("domain", domain);

    try {
      const result = await registerDomain(formData);

      if (!result?.success) {
        setError(result?.error ?? "Failed to register domain.");
        return;
      }

      router.push("/onboarding"); // Redirect to success page after successful registration
    } catch {
      setError("Failed to register domain.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className=" flex items-center flex-1 justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-center">Domain Details</h2>

        <div className="bg-accent dark:bg-accent-secondary border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-primary dark:text-blue-100">
            Valid Domain Format:
          </p>
          <ul className="text-sm text-primary dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>
              Do NOT include{" "}
              <code className="bg-white/50 px-1 rounded">http://</code> or{" "}
              <code className="bg-white/50 px-1 rounded">https://</code>
            </li>
            <li>Protocol prefixes are automatically blocked</li>
            <li>Use only valid domain names with TLD</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-2">
            <Field>
              <FieldLabel htmlFor="fieldgroup-name">Domain Name</FieldLabel>
              <FieldDescription>
                Enter your domain without any protocol prefix
              </FieldDescription>
              <Input
                id="domain"
                placeholder="eg: example.com"
                value={domain}
                onChange={handleInputChange}
                className={error ? "border-red-500" : ""}
              />
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </Field>
            <Field orientation="horizontal" className="justify-end gap-2">
              <Button
                type="reset"
                variant="outline"
                onClick={() => {
                  setDomain("");
                  setError("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={!domain || pending}>
                {pending ? "Submitting..." : "Submit"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
