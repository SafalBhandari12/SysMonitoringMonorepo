"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ApiRow = {
  id: string;
  name: string;
  status: "UP" | "DOWN";
  uptime: number | null;
  p90: number | null;
  p99: number | null;
};

const formatLatency = (value: number | null) =>
  value === null ? "N/A" : `${Math.round(value)} ms`;

const formatUptime = (value: number | null) =>
  value === null ? "N/A" : `${value.toFixed(2)}%`;

export const columns: ColumnDef<ApiRow>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as "UP" | "DOWN";
      return (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "UP" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {status === "UP" ? "Up" : "Down"}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <div className="text-center">Name</div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium text-left">{name}</div>;
    },
  },
  {
    accessorKey: "uptime",
    header: ({ column }) => <div className="text-center">Uptime</div>,
    cell: ({ row }) => {
      const uptime = row.getValue("uptime") as number | null;
      return (
        <div className="text-left font-medium">{formatUptime(uptime)}</div>
      );
    },
  },
  {
    accessorKey: "p90",
    header: ({ column }) => <div className="text-center">P90</div>,
    cell: ({ row }) => {
      const p90 = row.getValue("p90") as number | null;
      return <div className="text-left font-medium">{formatLatency(p90)}</div>;
    },
  },
  {
    accessorKey: "p99",
    header: ({ column }) => <div className="text-center">P99</div>,
    cell: ({ row }) => {
      const p99 = row.getValue("p99") as number | null;
      return <div className="text-left font-medium">{formatLatency(p99)}</div>;
    },
  },
  {
    id: "actions",
    header: ({ column }) => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      const api = row.original;
      const meta = table.options.meta as
        | {
            onDelete?: (apiId: string, apiName: string) => void;
          }
        | undefined;

      return (
        <div className="text-left">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (meta?.onDelete) {
                    meta.onDelete(api.id, api.name);
                  }
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
