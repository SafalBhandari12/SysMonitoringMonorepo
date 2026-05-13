"use client";

import addApiGroupAction from "@/actions/dashboard/addApiGroup";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CreateApiGroup({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled && nextOpen) {
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus />
          New API Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Group</DialogTitle>
          <DialogDescription>
            Group related endpoints so your monitoring stays easier to scan.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-api-group-form"
          action={(formData) => {
            startTransition(async () => {
              await addApiGroupAction(formData);
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" placeholder="Payments" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Checkout, invoices, refunds..."
                rows={4}
              />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending || disabled}
          >
            Cancel
          </Button>
          <SubmitButton isPending={isPending} disabled={disabled} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ isPending, disabled }: { isPending: boolean; disabled: boolean }) {
  return (
    <Button
      type="submit"
      form="create-api-group-form"
      disabled={isPending || disabled}
    >
      {isPending ? "Creating..." : "Create Group"}
    </Button>
  );
}
