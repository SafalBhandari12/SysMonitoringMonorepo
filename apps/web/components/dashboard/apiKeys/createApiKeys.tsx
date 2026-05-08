"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createApiKeysSchema } from "@/schema/createApiKeys";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import addApiKeyAction from "@/actions/dashboard/addApiKey";
import { useRouter } from "next/navigation";

export function CreateApiKeys() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof createApiKeysSchema>>({
    resolver: zodResolver(createApiKeysSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof createApiKeysSchema>) {
    startTransition(async () => {
      const res = await addApiKeyAction(data);
      if (res.success) {
        toast.success("Api key created successfully", {
          description: `Make sure to save your api key somewhere safe.
          ${res.rawKey!} `,
          action: {
            label: "Copy",
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(res.rawKey!);
                toast.success("Copied to clipboard");
              } catch {
                toast.error("Failed to copy");
              }
            },
          },
          position: "top-center",
          duration: Infinity,
        });

        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error("Failed to create api key", {
          action: {
            label: "x",
            onClick: () => {},
          },
        });
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            The raw key is shown once after creation.
          </DialogDescription>
        </DialogHeader>

        <form id="create-api-key-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="api-key-name">API key name</FieldLabel>
                  <Input
                    {...field}
                    id="api-key-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Production worker"
                    autoComplete="apiKeys"
                  />
                  <FieldDescription>
                    Once an API key is generated, you won&apos;t be able to see
                    it again, so make sure to save it somewhere safe.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-api-key-form" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
