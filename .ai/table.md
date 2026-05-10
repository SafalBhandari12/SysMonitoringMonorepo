# Building Data Tables with shadcn and TanStack Table: Complete Guide

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Installation & Setup](#installation--setup)
3. [Project Structure](#project-structure)
4. [Building Your First Basic Table](#building-your-first-basic-table)
5. [Column Definitions](#column-definitions)
6. [The DataTable Component](#the-datatable-component)
7. [Rendering the Table](#rendering-the-table)
8. [Formatting Cell Data](#formatting-cell-data)
9. [Adding Row Actions](#adding-row-actions)
10. [Server-Side Pagination](#server-side-pagination)
11. [Server-Side Sorting](#server-side-sorting)
12. [Filtering Data](#filtering-data)

---

## Core Concepts

Before diving into code, let's understand what we're building and why we need it.

### What is a Data Table?

A data table is a UI component that displays data in a tabular format (rows and columns). It's used everywhere:

- Admin dashboards showing user lists
- E-commerce showing products or orders
- Analytics dashboards showing metrics
- Any application that needs to display structured data

### Why TanStack Table?

When you have a lot of data (hundreds or thousands of rows), you can't just render them all at once. You need:

- **Pagination**: Show 10 rows per page, load the next 10 when needed
- **Sorting**: Let users click a column header to sort by that column
- **Filtering**: Show only rows that match certain criteria
- **Selection**: Allow users to select multiple rows for bulk actions

TanStack Table (formerly React Table) is a **headless** library — it handles all the logic but doesn't render HTML. This is where **shadcn** comes in: it provides pre-built, styled UI components that work with TanStack Table.

### The Two-Library Approach

- **TanStack Table** = Brain (handles state, logic, sorting, filtering, pagination)
- **shadcn Table** = Face (HTML elements with Tailwind styling)

---

## Installation & Setup

### Step 1: Add the shadcn Table Component

The shadcn table component provides styled HTML table elements (`Table`, `TableHead`, `TableBody`, `TableCell`, etc.):

```bash
npx shadcn@latest add table
```

This installs the UI components into your project.

### Step 2: Install TanStack React Table

TanStack Table provides the logic layer:

```bash
npm install @tanstack/react-table
```

That's it! You now have both pieces.

---

## Project Structure

We'll organize our code into three files following React best practices:

```
app/payments/
├── columns.tsx       (client component) - Column definitions
├── data-table.tsx    (client component) - DataTable component
└── page.tsx          (server component) - Page that fetches and renders
```

**Why this structure?**

- `columns.tsx`: Defines what columns to display and how to format them
- `data-table.tsx`: Reusable component that renders any data with any columns
- `page.tsx`: Server component that fetches data and passes it to the table

This pattern works in any React framework (Next.js, Vite, CRA, etc.).

---

## Building Your First Basic Table

Let's build a table showing payment data. First, we need sample data.

### Example Data Structure

```typescript
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ... more payments
];
```

---

## Column Definitions

### What Are Column Definitions?

A column definition tells TanStack Table:

- Where to find the data (which field in your object)
- What header text to display
- How to format/render the cell content

Think of it as a blueprint for each column.

### Creating columns.tsx

```typescript
"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
```

**Key Properties:**

| Property      | Purpose                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `accessorKey` | Which field in your data object to display (e.g., `"status"` → `row.status`) |
| `header`      | Column header text or React element                                          |
| `cell`        | (Optional) Custom render function for the cell                               |
| `id`          | (Optional) Unique identifier for the column                                  |

**"use client"**: This is a Next.js directive saying this component runs in the browser (not on server).

---

## The DataTable Component

### What Does This Component Do?

The `DataTable` component:

1. Takes column definitions and data
2. Uses TanStack Table hooks to manage state
3. Renders the table HTML using shadcn components

It's generic (works with any data type) and reusable across your app.

### Creating data-table.tsx

```typescript
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        {/* Render table headers */}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>

        {/* Render table body */}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Breaking Down the Code

**useReactTable Hook:**

```typescript
const table = useReactTable({
  data, // Your data array
  columns, // Column definitions
  getCoreRowModel: getCoreRowModel(), // Plugin to render rows
});
```

This creates a table instance that manages state and provides helper methods.

**Rendering Headers:**

```typescript
table.getHeaderGroups(); // Returns header groups
```

**Rendering Rows:**

```typescript
table.getRowModel().rows; // Returns current rows to display
```

**flexRender:**
This utility renders either a string, React element, or function result. It's flexible enough to handle different column definition formats.

---

## Rendering the Table

### Creating page.tsx

This is where we bring it all together:

```typescript
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here
  // This runs on the server
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ... more payments
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

**Key Points:**

- `page.tsx` is an async server component (no "use client")
- Data fetching happens on the server (secure, no API exposure)
- Pass data and columns to `DataTable` component
- The table renders

---

## Formatting Cell Data

### Why Format Cells?

Sometimes you don't want to display raw data. For example:

- Display `100` as `$100.00` (currency formatting)
- Display `true` as `Active` or `false` as `Inactive`
- Display timestamps in human-readable format

### Updating Column Definitions

Update the `columns.tsx` file to add a custom cell renderer:

```typescript
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))

      // Format as US currency
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
```

**How It Works:**

1. `cell` is a render function that receives `{ row, cell, table }` etc.
2. `row.getValue("amount")` gets the value from that row
3. We format it and return JSX
4. The `header` property can also be a function for custom header rendering

### Common Formatting Examples

**Status Badge:**

```typescript
{
  accessorKey: "status",
  cell: ({ row }) => {
    const status = row.getValue("status") as string
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return (
      <span className={`px-2 py-1 rounded ${colors[status]}`}>
        {status}
      </span>
    )
  },
}
```

**Date Formatting:**

```typescript
{
  accessorKey: "createdAt",
  cell: ({ row }) => {
    const date = new Date(row.getValue("createdAt"))
    return date.toLocaleDateString()
  },
}
```

---

## Adding Row Actions

### What Are Row Actions?

Row actions are menu items that perform operations on a specific row. Common examples:

- Edit this row
- Delete this row
- View details
- Copy ID to clipboard

We'll use a dropdown menu for this.

### Updated columns.tsx with Actions

```typescript
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Payment>[] = [
  // ... your other columns ...

  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

**Key Points:**

- `id: "actions"` — This column has no data, just UI
- `row.original` — Access the full row object
- Use `onClick` handlers to perform actions
- Example: `navigator.clipboard.writeText()` copies to clipboard

### Common Action Patterns

**Make API Call:**

```typescript
<DropdownMenuItem
  onClick={async () => {
    await fetch(`/api/payments/${payment.id}`, { method: "DELETE" })
  }}
>
  Delete
</DropdownMenuItem>
```

**Navigate to Detail Page:**

```typescript
import { useRouter } from "next/navigation"

const router = useRouter()

<DropdownMenuItem onClick={() => router.push(`/payments/${payment.id}`)}>
  View Details
</DropdownMenuItem>
```

---

## Server-Side Pagination

### Why Server-Side Pagination?

If you have 100,000 payments, you can't send all of them to the browser at once. Server-side pagination:

1. Only sends the current page's data (e.g., 10 rows)
2. Keeps total row count so you know how many pages exist
3. When user clicks "Next", fetch the next page from the server

### How It Works (Conceptual)

```
Client: "Give me page 0 with 10 rows"
Server: Queries DB with SKIP=0 TAKE=10, also counts total rows
Server: Returns { rows: [...], total: 5000 }
Client: Now knows there are 500 pages total
User clicks "Next"
Client: "Give me page 1 with 10 rows"
```

### Updated DataTable Component

Add pagination state management to `data-table.tsx`:

```typescript
"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount: number  // Total rows in database
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,  // Key: Don't paginate client-side
    rowCount,                // Total rows (to calculate page count)
    state: { pagination },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater
      onPaginationChange(next)
    },
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          {/* Headers and body same as before */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

**Critical Settings:**

- `manualPagination: true` — Tells TanStack "I'll handle pagination, don't slice rows locally"
- `rowCount` — Total rows in database (used to calculate total page count)
- `onPaginationChange` — Called when user clicks Previous/Next

### Parent Component with State

Update `page.tsx` or your parent component to manage pagination:

```typescript
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default function PaymentsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Fetch data based on current page
  const { data, isLoading } = useQuery({
    queryKey: ["payments", pagination],
    queryFn: () =>
      fetch(
        `/api/payments?page=${pagination.pageIndex}&limit=${pagination.pageSize}`
      ).then((r) => r.json()),
    placeholderData: keepPreviousData,  // Don't blank out table while loading
  })

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        rowCount={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
```

### Backend API Endpoint

Your API should accept `page` and `limit` query parameters:

```typescript
// pages/api/payments.ts (Next.js example)
export default async function handler(req, res) {
  const { page = 0, limit = 10 } = req.query;

  const pageIndex = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = pageIndex * pageSize;

  const [rows, total] = await Promise.all([
    db.payment.findMany({
      skip,
      take: pageSize,
    }),
    db.payment.count(),
  ]);

  res.json({ rows, total });
}
```

Or with Prisma directly:

```typescript
const [rows, total] = await Promise.all([
  db.payment.findMany({
    skip: pageIndex * pageSize,
    take: pageSize,
  }),
  db.payment.count(),
]);

return { rows, total };
```

---

## Server-Side Sorting

### How Sorting Works

Sorting happens on the server just like pagination. When user clicks a column header:

1. Send sort column name and direction (asc/desc) to server
2. Server applies ORDER BY in database query
3. Return sorted results

### Updated DataTable Component

Add sorting state to your table hook:

```typescript
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,  // Don't sort client-side
    rowCount,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater
      onPaginationChange(next)
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      onSortingChange(next)
      // Reset to first page when sorting changes
      onPaginationChange({ ...pagination, pageIndex: 0 })
    },
  })

  return (
    // ... same render code as before ...
  )
}
```

**Key Points:**

- `manualSorting: true` — Don't sort client-side
- `onSortingChange` — Handle sort state updates
- Reset `pageIndex` to 0 when sorting changes (otherwise you might land on an invalid page)

### Parent Component

Update your parent component to manage sorting:

```typescript
"use client"

import { useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./data-table"

export default function PaymentsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const { data } = useQuery({
    queryKey: ["payments", pagination, sorting],
    queryFn: () => {
      // Build sort parameter
      const sortParam = sorting[0]
        ? `&sortBy=${sorting[0].id}&sortDir=${sorting[0].desc ? "desc" : "asc"}`
        : ""

      return fetch(
        `/api/payments?page=${pagination.pageIndex}&limit=${pagination.pageSize}${sortParam}`
      ).then((r) => r.json())
    },
    placeholderData: keepPreviousData,
  })

  return (
    <DataTable
      columns={columns}
      data={data?.rows ?? []}
      rowCount={data?.total ?? 0}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
```

**How sorting works:**

- `sorting` is an array: `[{ id: "amount", desc: true }]`
- `sorting[0]` gets the first (primary) sort
- `.id` is the column ID (from your column definition)
- `.desc` is true for descending, false for ascending

### Backend API

Handle the sort parameters:

```typescript
export default async function handler(req, res) {
  const { page = 0, limit = 10, sortBy, sortDir } = req.query;

  const pageIndex = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = pageIndex * pageSize;

  // Build orderBy object
  let orderBy = { createdAt: "desc" }; // Default sort

  if (sortBy) {
    // Whitelist allowed columns to prevent injection
    const allowedColumns = ["id", "email", "amount", "status", "createdAt"];
    if (allowedColumns.includes(sortBy)) {
      orderBy = { [sortBy]: sortDir === "desc" ? "desc" : "asc" };
    }
  }

  const [rows, total] = await Promise.all([
    db.payment.findMany({
      skip,
      take: pageSize,
      orderBy,
    }),
    db.payment.count(),
  ]);

  res.json({ rows, total });
}
```

**Security Note:**
Always whitelist allowed sort columns. Never directly use user input for `orderBy` to prevent SQL injection or unexpected sorting.

---

## Filtering Data

### How Filtering Works

Filtering is similar to sorting and pagination:

1. User enters filter criteria (e.g., status = "pending")
2. Send to server
3. Server applies WHERE clause
4. Return filtered results

### Implementation Overview

This requires adding filter state and passing it to your API, similar to sorting. The exact implementation depends on your filter UI and data structure.

**Basic Concept:**

```typescript
const [filters, setFilters] = useState({
  status: null,
  minAmount: null,
  maxAmount: null,
});

// Build query string with filters
const filterParams = new URLSearchParams();
if (filters.status) filterParams.append("status", filters.status);
if (filters.minAmount) filterParams.append("minAmount", filters.minAmount);
if (filters.maxAmount) filterParams.append("maxAmount", filters.maxAmount);

const { data } = useQuery({
  queryKey: ["payments", pagination, sorting, filters],
  queryFn: () =>
    fetch(
      `/api/payments?${filterParams}&page=${pagination.pageIndex}&limit=${pagination.pageSize}`,
    ).then((r) => r.json()),
});
```

### Backend Filter Logic

```typescript
export default async function handler(req, res) {
  const { page = 0, limit = 10, status, minAmount, maxAmount } = req.query;

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (minAmount) where.amount = { gte: parseInt(minAmount) };
  if (maxAmount) {
    where.amount = { ...where.amount, lte: parseInt(maxAmount) };
  }

  const [rows, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip: parseInt(page) * parseInt(limit),
      take: parseInt(limit),
    }),
    db.payment.count({ where }),
  ]);

  res.json({ rows, total });
}
```

---

## Complete Example

Here's how all three features (pagination, sorting, filtering) work together:

### Full Page Component

```typescript
"use client"

import { useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default function PaymentsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState({
    status: "",
    minAmount: "",
    maxAmount: "",
  })

  const { data, isLoading } = useQuery({
    queryKey: ["payments", pagination, sorting, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append("page", pagination.pageIndex.toString())
      params.append("limit", pagination.pageSize.toString())

      if (sorting[0]) {
        params.append("sortBy", sorting[0].id)
        params.append("sortDir", sorting[0].desc ? "desc" : "asc")
      }

      if (filters.status) params.append("status", filters.status)
      if (filters.minAmount) params.append("minAmount", filters.minAmount)
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount)

      return fetch(`/api/payments?${params}`).then((r) => r.json())
    },
    placeholderData: keepPreviousData,
  })

  return (
    <div className="container mx-auto py-10">
      {/* Filter Controls */}
      <div className="mb-4 flex gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="number"
          placeholder="Min Amount"
          value={filters.minAmount}
          onChange={(e) =>
            setFilters({ ...filters, minAmount: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Max Amount"
          value={filters.maxAmount}
          onChange={(e) =>
            setFilters({ ...filters, maxAmount: e.target.value })
          }
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.rows ?? []}
        rowCount={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </div>
  )
}
```

---

## Summary

You've learned how to build a professional data table with:

1. ✅ **Column Definitions** — What to display
2. ✅ **DataTable Component** — Reusable table UI
3. ✅ **Cell Formatting** — Custom cell rendering
4. ✅ **Row Actions** — Dropdown menus for actions
5. ✅ **Server-Side Pagination** — Efficient large datasets
6. ✅ **Server-Side Sorting** — Database-level sorting
7. ✅ **Filtering** — Query-based filtering

The key principle: Keep TanStack Table for state management and pass control to the server for heavy lifting (pagination, sorting, filtering). This ensures your app scales well even with millions of rows.
