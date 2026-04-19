"use client";

import addApiGroupAction from "@/actions/dashboard/addApiGroup";
import { useFormStatus } from "react-dom";

export default function CreateApiGroup() {
  return (
    <form action={addApiGroupAction} className="w-3/6">
      <h1 className="text-2xl font-bold mb-4">Create API Group</h1>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows={4}
        />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-black text-white rounded-md cursor-pointer disabled:bg-gray-400"
    >
      {pending ? "Creating..." : "Create API Group"}
    </button>
  );
}
