"use client";

import React from "react";
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label: string;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
    icon?: React.ComponentType<{ className?: string }>;
  };
};

interface ChartContainerProps {
  config: ChartConfig;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  config,
  children,
  className = "",
}: ChartContainerProps) {
  const colorVars = Object.entries(config).reduce(
    (vars, [key, value]) => {
      const color = value.theme?.light ?? value.color;

      if (color) {
        vars[`--color-${key}`] = color;
      }

      return vars;
    },
    {} as Record<string, string>,
  );

  return (
    <div
      className={cn("w-full", className)}
      style={
        {
          ...colorVars,
          "--chart-1": "#3b82f6",
          "--chart-2": "#06b6d4",
          "--chart-3": "#ec4899",
          "--chart-4": "#f59e0b",
          "--chart-5": "#10b981",
        } as React.CSSProperties
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = RechartsTooltip;

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  labelKey?: string;
  nameKey?: string;
  valueFormatter?: (value: number | string) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  valueFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {!hideLabel && label && (
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            {!hideIndicator && indicator === "line" && (
              <div
                className="h-px w-3"
                style={{ backgroundColor: entry.color || "#999" }}
              />
            )}
            {!hideIndicator && indicator === "dashed" && (
              <div
                className="h-px w-3 border-t border-dashed"
                style={{ borderColor: entry.color || "#999" }}
              />
            )}
            {!hideIndicator && indicator === "dot" && (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || "#999" }}
              />
            )}
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {entry.name}
            </span>
            <span className="ml-auto text-xs font-semibold text-slate-900 dark:text-slate-50">
              {valueFormatter
                ? valueFormatter(entry.value)
                : typeof entry.value === "number"
                  ? entry.value.toFixed(2)
                  : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsLegend;

interface ChartLegendContentProps {
  nameKey?: string;
  payload?: Array<{
    value: string;
    color: string;
    dataKey?: string;
  }>;
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
