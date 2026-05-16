"use client";

import addApiAction from "@/actions/dashboard/addApi";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import KeyValueInput from "@/components/dashboard/api/keyValueInput";
import SelectApiGroup from "@/components/dashboard/api/SelectApiGroup";
import SelectMethod from "@/components/dashboard/api/SelectMethod";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export default function CreateApiPage() {
  const [selectedApiGroup, setSelectedApiGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [, setSelectedMethod] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await addApiAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.success) {
        toast.success("API created successfully");
        // Only reset form and state after successful completion
        setSelectedApiGroup(null);
        if (formRef.current) {
          formRef.current.reset();
        }
        router.push("/dashboard/api");
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (window.location.pathname !== "/dashboard/api") {
              window.location.href = "/dashboard/api";
            }
          }, 200);
        }
      }
    });
  };

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
        <form
          ref={formRef}
          id="create-api-form"
          action={handleSubmit}
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
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="method">Method</FieldLabel>
                <SelectMethod setMethod={setSelectedMethod} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="targetUrl">Target URL</FieldLabel>
              <Input
                id="targetUrl"
                name="targetUrl"
                placeholder="https://example.com/api/v1/users"
                required
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Paste the full URL to monitor (copy-paste complete URL). The system will call this URL directly.
              </p>
            </Field>
            <Field>
              <FieldLabel>API Group</FieldLabel>
              <SelectApiGroup setGroup={setSelectedApiGroup} disabled={isPending} />
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
            disabled={isPending || !selectedApiGroup}
          >
            {isPending ? "Creating..." : "Create API"}
          </Button>
        </div>
      </div>
    </div>
  );
}
