"use client";

import addApiAction from "@/actions/dashboard/addApi";
import KeyValueInput from "./keyValueInput";
import { useFormStatus } from "react-dom";
import { startTransition, useState } from "react";
import SelectApiGroup from "./SelectApiGroup";
import { useRouter } from "next/navigation";

interface ApiGroup {
  id: string;
  name: string;
}

export default function CreateApi() {
  const [selectedApiGroup, setSelectedApiGroup] = useState<ApiGroup | null>(
    null,
  );
  const router = useRouter();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await addApiAction(formData);
          router.refresh();
        });
      }}
      className="w-3/6"
    >
      <h1 className="text-2xl font-bold mb-4">Create API</h1>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-primary"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="mt-1 block w-full border border-border rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="path"
          className="block text-sm font-medium text-primary"
        >
          Path
        </label>
        <input
          type="text"
          id="path"
          name="path"
          placeholder="/api/v1/users"
          className="mt-1 block w-full border border-border rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="method"
          className="block text-sm font-medium text-primary"
        >
          Method
        </label>
        <select
          id="method"
          name="method"
          className="mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-background"
          required
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary">
          API Group
        </label>
        <SelectApiGroup setGroup={setSelectedApiGroup} />
        {!selectedApiGroup && (
          <p className="text-destructive text-sm mt-1">
            Please select an API group
          </p>
        )}
        <input
          type="hidden"
          name="apiGroupId"
          value={selectedApiGroup?.id || ""}
        />
      </div>
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
      <SubmitButton isDisabled={!selectedApiGroup} />
    </form>
  );
}

function SubmitButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || isDisabled}
      className="px-4 py-2 bg-background text-primary rounded-md cursor-pointer disabled:bg-primary/50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create API"}
    </button>
  );
}
