"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SortingState } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/dashboard/api-table/data-table";
import { columns } from "@/components/dashboard/api-table/columns";
import { DeleteConfirmationDialog } from "@/components/dashboard/api-table/delete-dialog";
import { deleteApiAction } from "@/actions/dashboard/deleteApi";

type ApiData = {
  id: string;
  name: string;
  apiGroupName: string;
  status: "UP" | "DOWN";
  uptime: number | null;
  p90: number | null;
  p99: number | null;
};

export function ApiStatusTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-20 mx-auto" />
            </th>
            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-12 mx-auto" />
            </th>
            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-12 mx-auto" />
            </th>
            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
              <Skeleton className="h-4 w-8 mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b">
              <td className="h-16 px-4 align-middle">
                <Skeleton className="h-6 w-12" />
              </td>
              <td className="h-16 px-4 align-middle">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="h-16 px-4 align-middle text-center">
                <Skeleton className="h-4 w-20 mx-auto" />
              </td>
              <td className="h-16 px-4 align-middle text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
              </td>
              <td className="h-16 px-4 align-middle text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
              </td>
              <td className="h-16 px-4 align-middle text-center">
                <Skeleton className="h-6 w-8 mx-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ApiStatusTableProps {
  initialApis: ApiData[];
  availableGroups: { id: string; name: string }[];
  onApiDeleted?: () => void;
}

export function ApiStatusTable({
  initialApis,
  availableGroups,
  onApiDeleted,
}: ApiStatusTableProps) {
  const [apis, setApis] = useState<ApiData[]>(initialApis);
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    apiId: string | null;
    apiName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    apiId: null,
    apiName: "",
    isLoading: false,
  });

  // Fetch APIs with search and sort filters
  useEffect(() => {
    const fetchApis = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) {
          params.append("search", search);
        }
        if (selectedGroupId) {
          params.append("groupId", selectedGroupId);
        }
        if (sorting.length > 0) {
          params.append("sortBy", sorting[0].id);
          params.append("sortDir", sorting[0].desc ? "desc" : "asc");
        }

        const response = await fetch(
          `/api/dashboard/overview?${params.toString()}`,
          { cache: "no-store" },
        );
        const data = await response.json();
        setApis(data.apis || []);
      } catch (error) {
        console.error("Error fetching APIs:", error);
        toast.error("Failed to fetch APIs");
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchApis();
    }, 500); // Debounce search input with 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [search, selectedGroupId, sorting]);

  const handleDeleteClick = (apiId: string, apiName: string) => {
    setDeleteState({
      isOpen: true,
      apiId,
      apiName,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.apiId) return;

    setDeleteState((prev) => ({ ...prev, isLoading: true }));

    try {
      await deleteApiAction(deleteState.apiId);
      toast.success(`API "${deleteState.apiName}" has been deleted.`);
      setDeleteState({
        isOpen: false,
        apiId: null,
        apiName: "",
        isLoading: false,
      });

      // Refetch APIs
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }
      if (selectedGroupId) {
        params.append("groupId", selectedGroupId);
      }
      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortDir", sorting[0].desc ? "desc" : "asc");
      }
      const response = await fetch(
        `/api/dashboard/overview?${params.toString()}`,
        {
          cache: "no-store",
        },
      );
      const data = await response.json();
      setApis(data.apis || []);

      onApiDeleted?.();
    } catch (error) {
      toast.error("Failed to delete API. Please try again.");
      setDeleteState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteState({
      isOpen: false,
      apiId: null,
      apiName: "",
      isLoading: false,
    });
  };

  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search by API name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
              </div>
            )}
          </div>

          <Select
            value={selectedGroupId ?? "all"}
            onValueChange={(value) =>
              setSelectedGroupId(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full md:w-55">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {availableGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {apis.length === 0 && isLoading ? (
          <ApiStatusTableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={apis}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            meta={{
              onDelete: handleDeleteClick,
            }}
          />
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteState.isOpen}
        apiName={deleteState.apiName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteState.isLoading}
      />
    </>
  );
}
