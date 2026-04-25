// components/app-toaster.tsx
"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  console.log("Current resolved  theme:", resolvedTheme);

  return (
    <Toaster position="top-right" theme={resolvedTheme as "light" | "dark"} />
  );
}
