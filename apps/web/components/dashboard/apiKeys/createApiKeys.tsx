"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createApiKeysSchema } from "@/schema/createApiKeys";
import { useTransition } from "react";
import addApiKeyAction from "@/actions/dashboard/addApiKey";
import { useRouter } from "next/navigation";

export function CreateApiKeys() {
  const router = useRouter();
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
              } catch (err) {
                toast.error("Failed to copy");
              }
            },
          },
          position: "top-center",
          duration: Infinity,
        });

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
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create Api Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-username">
                    Api Key name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Api Key 1"
                    autoComplete="apiKeys"
                  />
                  <FieldDescription>
                    Once api key is generated, you won't be able to see it
                    again, so make sure to save it somewhere safe.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <form>
            <Button type="submit" form="form-rhf-input">
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Field>
      </CardFooter>
    </Card>
  );
}
