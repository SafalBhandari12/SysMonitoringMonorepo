"use client";

import addApiAction from "@/actions/dashboard/addApi";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import KeyValueInput from "@/components/dashboard/api/keyValueInput";
import SelectApiGroup from "@/components/dashboard/api/SelectApiGroup";
import SelectMethod from "@/components/dashboard/api/SelectMethod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type DomainState = {
  verificationStatus: "PENDING" | "VERIFIED" | "FAILED";
} | null;

export default function CreateApiPage() {
  const [selectedApiGroup, setSelectedApiGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [domain, setDomain] = useState<DomainState | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasVerifiedDomain = domain?.verificationStatus === "VERIFIED";

  useEffect(() => {
    let isMounted = true;

    fetch("/api/onboarding/domain")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: DomainState) => {
        if (isMounted) setDomain(payload);
      })
      .catch(() => {
        if (isMounted) setDomain(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Create API</h1>
          <p className="text-sm text-muted-foreground">
            Add an endpoint to monitor and attach it to one of your API groups.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {domain !== undefined && !hasVerifiedDomain && (
          <Alert className="mb-4">
            <AlertTitle>Verify your domain first</AlertTitle>
            <AlertDescription>
              Monitored APIs need a verified domain before they can be created.{" "}
              <Link href="/dashboard/domain">Go to Domain</Link>
            </AlertDescription>
          </Alert>
        )}

        <form
          id="create-api-form"
          action={(formData) => {
            startTransition(async () => {
              await addApiAction(formData);
              setSelectedApiGroup(null);
              router.push("/dashboard/api");
              router.refresh();
            });
          }}
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="List users"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="method">Method</FieldLabel>
                <SelectMethod setMethod={setSelectedMethod} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="path">Path</FieldLabel>
              <Input
                id="path"
                name="path"
                placeholder="/api/v1/users"
                required
              />
            </Field>
            <Field>
              <FieldLabel>API Group</FieldLabel>
              <SelectApiGroup setGroup={setSelectedApiGroup} />
              {!selectedApiGroup && (
                <p className="text-sm text-destructive">
                  Please select an API group.
                </p>
              )}
              <input
                type="hidden"
                name="apiGroupId"
                value={selectedApiGroup?.id || ""}
              />
            </Field>
            <div className="grid gap-4">
              <KeyValueInput
                label="Headers (Optional)"
                name="headers"
                placeholder="header value"
              />
              <KeyValueInput
                label="Path Params (Optional)"
                name="pathParams"
                placeholder="param value"
              />
              <KeyValueInput
                label="Query Params (Optional)"
                name="queryParams"
                placeholder="query value"
              />
              <KeyValueInput
                label="Body (Optional)"
                name="body"
                placeholder="field value"
              />
            </div>
          </FieldGroup>
        </form>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="submit"
            form="create-api-form"
            disabled={isPending || !selectedApiGroup || !hasVerifiedDomain}
          >
            {isPending ? "Creating..." : "Create API"}
          </Button>
        </div>
      </div>
    </div>
  );
}
