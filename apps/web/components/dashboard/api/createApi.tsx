"use client";

import addApiAction from "@/actions/dashboard/addApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import KeyValueInput from "./keyValueInput";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SelectApiGroup from "./SelectApiGroup";

interface ApiGroup {
  id: string;
  name: string;
}

export default function CreateApi() {
  const [selectedApiGroup, setSelectedApiGroup] = useState<ApiGroup | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setSelectedApiGroup(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          New API
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create API</DialogTitle>
          <DialogDescription>
            Add an endpoint to monitor and attach it to one of your API groups.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-api-form"
          action={(formData) => {
            startTransition(async () => {
              await addApiAction(formData);
              setOpen(false);
              setSelectedApiGroup(null);
              router.refresh();
            });
          }}
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" placeholder="List users" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="method">Method</FieldLabel>
                <select
                  id="method"
                  name="method"
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <SubmitButton isDisabled={!selectedApiGroup} isPending={isPending} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({
  isDisabled,
  isPending,
}: {
  isDisabled: boolean;
  isPending: boolean;
}) {
  return (
    <Button
      type="submit"
      form="create-api-form"
      disabled={isPending || isDisabled}
    >
      {isPending ? "Creating..." : "Create API"}
    </Button>
  );
}
