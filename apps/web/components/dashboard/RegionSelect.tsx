"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const regionOptions = ["all", "IN", "KR", "US", "EU", "SG", "SA"] as const;

export function RegionSelect({
  value,
  onPendingChange,
}: {
  value: string;
  onPendingChange?: (pending: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateRegion = (nextValue: string) => {
    onPendingChange?.(true);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextValue === "all") {
        params.delete("region");
      } else {
        params.set("region", nextValue);
      }

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Select value={value} onValueChange={updateRegion} disabled={isPending}>
      <SelectTrigger className="h-9 w-35">
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <SelectValue placeholder="Region" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {regionOptions.map((region) => (
          <SelectItem key={region} value={region}>
            {region === "all" ? "All regions" : region}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
