"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

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
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
        />
        <button
          type="button"
          onClick={addPair}
          className="px-3 py-2 bg-black text-white rounded-md cursor-pointer flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {pairs.length > 0 && (
        <div className="space-y-2 mb-3">
          {pairs.map((pair) => (
            <div
              key={pair.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <div className="flex gap-2 flex-1">
                <span className="font-medium text-gray-700 min-w-24">
                  {pair.key}
                </span>
                <span className="text-gray-600">:</span>
                <span className="text-gray-600 break-all">{pair.value}</span>
              </div>
              <button
                type="button"
                onClick={() => removePair(pair.id)}
                className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name={name} value={jsonValue} />
    </div>
  );
}
