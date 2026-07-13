"use client";

import addApiGroupAction, {
  AddApiGroupResult,
} from "@/actions/dashboard/addApiGroup";
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
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

type CreatedApiGroup = NonNullable<AddApiGroupResult["apiGroup"]>;

export default function CreateApiGroup({
  disabled = false,
  trigger,
  onCreated,
}: {
  disabled?: boolean;
  /** Custom trigger element. Defaults to a "New API Group" button. */
  trigger?: ReactNode;
  /**
   * Called with the newly created group instead of the default
   * router.refresh() + full page reload behavior. Use this when embedding
   * the dialog inline on another page (e.g. Create API) so the rest of the
   * page's state (like an in-progress form) isn't blown away.
   */
  onCreated?: (group: CreatedApiGroup) => void;
}) {
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
        {trigger ?? (
          <Button>
            <Plus />
            New API Group
          </Button>
        )}
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
              const result = await addApiGroupAction(formData);

              if (result.error || !result.apiGroup) {
                toast.error(result.error || "Failed to create API group");
                return;
              }

              setOpen(false);

              if (onCreated) {
                onCreated(result.apiGroup);
                return;
              }

              router.refresh();
              if (typeof window !== "undefined") {
                setTimeout(() => {
                  window.location.reload();
                }, 200);
              }
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

function SubmitButton({
  isPending,
  disabled,
}: {
  isPending: boolean;
  disabled: boolean;
}) {
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
