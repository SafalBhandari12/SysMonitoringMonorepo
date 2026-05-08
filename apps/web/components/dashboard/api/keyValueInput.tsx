"use client";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

interface KeyValueInputProps {
  label: string;
  name: string;
  placeholder?: string;
}

export default function KeyValueInput({
  label,
  name,
  placeholder = "value",
}: KeyValueInputProps) {
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");

  const addPair = () => {
    if (keyInput.trim() && valueInput.trim()) {
      setPairs([
        ...pairs,
        { id: Date.now().toString(), key: keyInput, value: valueInput },
      ]);
      setKeyInput("");
      setValueInput("");
    }
  };

  const removePair = (id: string) => {
    setPairs(pairs.filter((p) => p.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPair();
    }
  };

  const jsonValue =
    pairs.length > 0
      ? JSON.stringify(Object.fromEntries(pairs.map((p) => [p.key, p.value])))
      : "";

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          type="text"
          placeholder="Key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          onClick={addPair}
          variant="outline"
          className="sm:w-auto"
        >
          <Plus /> Add
        </Button>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-2">
          {pairs.map((pair) => (
            <div
              key={pair.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2"
            >
              <div className="flex flex-1 gap-2 text-sm">
                <span className="min-w-20 font-medium text-foreground">
                  {pair.key}
                </span>
                <span className="text-muted-foreground">:</span>
                <span className="break-all text-muted-foreground">
                  {pair.value}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => removePair(pair.id)}
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name={name} value={jsonValue} />
    </div>
  );
}
