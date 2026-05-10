"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function SelectMethod({
  setMethod,
  defaultValue,
}: {
  setMethod: (method: string) => void;
  defaultValue?: string;
}) {
  const [selectedMethod, setSelectedMethod] = useState(defaultValue || "");

  const handleChange = (value: string) => {
    setSelectedMethod(value);
    setMethod(value);
  };

  return (
    <>
      <Select value={selectedMethod} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a method" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name="method" value={selectedMethod} />
    </>
  );
}
