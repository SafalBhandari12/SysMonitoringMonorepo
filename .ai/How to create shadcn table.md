Table of Contents#
This guide will show you how to use TanStack Table and the <Table /> component to build your own custom data table. We'll cover the following topics:

Basic Table
Row Actions
Pagination
Sorting
Filtering
Visibility
Row Selection
Reusable Components
Installation#
Add the <Table /> component to your project:
pnpm
npm
yarn
bun
npx shadcn@latest add table
Copy
Add tanstack/react-table dependency:
pnpm
npm
yarn
bun
npm install @tanstack/react-table
Copy
Prerequisites#
We are going to build a table to show recent payments. Here's what our data looks like:

Copy
type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
 
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
  // ...
]
Project Structure#
Start by creating the following file structure:

Copy
app
└── payments
    ├── columns.tsx
    ├── data-table.tsx
    └── page.tsx
I'm using a Next.js example here but this works for any other React framework.

columns.tsx (client component) will contain our column definitions.
data-table.tsx (client component) will contain our <DataTable /> component.
page.tsx (server component) is where we'll fetch data and render our table.
Basic Table#
Let's start by building a basic table.

Column Definitions#
First, we'll define our columns.

app/payments/columns.tsx
Copy
"use client"
 
import { ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
 
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
]
Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

<DataTable /> component#
Next, we'll create a <DataTable /> component to render our table.

app/payments/data-table.tsx
Copy
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
 
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
Tip: If you find yourself using <DataTable /> in multiple places, this is the component you could make reusable by extracting it to components/ui/data-table.tsx.

<DataTable columns={columns} data={data} />

Render the table#
Finally, we'll render our table in our page component.

app/payments/page.tsx
Copy
import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"
 
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
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
Cell Formatting#
Let's format the amount cell to display the dollar amount. We'll also align the cell to the right.

Update columns definition#
Update the header and cell definitions for amount as follows:

app/payments/columns.tsx
Copy
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
You can use the same approach to format other cells and headers.

Row Actions#
Let's add row actions to our table. We'll use a <DropdownMenu /> component for this.

Update columns definition#
Update our columns definition to add a new actions column. The actions cell returns a <DropdownMenu /> component.

app/payments/columns.tsx
Copy
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
  // ...
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
  // ...
]
You can access the row data using row.original in the cell function. Use this to handle actions for your row eg. use the id to make a DELETE call to your API.


## how to handle pagination from server side
The core idea:
Instead of giving TanStack Table all rows and letting it paginate, you:

Keep pageIndex and pageSize in state
Pass those to your API/db query
Feed only the current page's rows to the table
Tell TanStack Table the total row count so it knows how many pages exist

Implementation:
tsximport { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]           // only current page's rows
  rowCount: number        // total rows in db (for page count calculation)
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
    manualPagination: true,       // tell TanStack: don't slice rows yourself
    rowCount,                     // needed to compute pageCount
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
          {/* your thead/tbody render */}
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
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
Parent / page component (where you own state and fetch):
tsxconst [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})

const { data, rowCount } = useQuery({
  queryKey: ["payments", pagination],
  queryFn: () =>
    fetch(`/api/payments?page=${pagination.pageIndex}&limit=${pagination.pageSize}`)
      .then(r => r.json()),
  placeholderData: keepPreviousData,  // avoid flicker on page change
})

return (
  <DataTable
    columns={columns}
    data={data?.rows ?? []}
    rowCount={data?.total ?? 0}
    pagination={pagination}
    onPaginationChange={setPagination}
  />
)
Your API/db query (e.g. Prisma):
tsconst [rows, total] = await Promise.all([
  db.payment.findMany({
    skip: pageIndex * pageSize,
    take: pageSize,
  }),
  db.payment.count(),
])

return { rows, total }
Key things to understand:

manualPagination: true is the switch — without it, TanStack ignores your page state and slices locally
rowCount (not pageCount) is preferred because you let TanStack derive page count as Math.ceil(rowCount / pageSize)
The onPaginationChange updater can be either a new value or a function (like a React setState), so the typeof updater === "function" check is necessary
keepPreviousData (TanStack Query v5: placeholderData: keepPreviousData) prevents the table from going blank while the next page loads


## How to sort the data:
Same pattern as pagination — flip to `manualSorting: true` and lift the state up.

**Update `useReactTable`:**

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  manualSorting: true,        // don't sort locally
  rowCount,
  state: { pagination, sorting },
  onPaginationChange: ...,
  onSortingChange: (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater
    onSortingChange(next)
    // reset to page 0 when sort changes
    onPaginationChange({ ...pagination, pageIndex: 0 })
  },
})
```

**Parent component:**

```tsx
const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
const [sorting, setSorting] = useState<SortingState>([])

const { data, rowCount } = useQuery({
  queryKey: ["payments", pagination, sorting],
  queryFn: () => {
    const sortParam = sorting[0]
      ? `&sortBy=${sorting[0].id}&sortDir=${sorting[0].desc ? "desc" : "asc"}`
      : ""
    return fetch(
      `/api/payments?page=${pagination.pageIndex}&limit=${pagination.pageSize}${sortParam}`
    ).then(r => r.json())
  },
  placeholderData: keepPreviousData,
})
```

**Prisma query:**

```ts
const orderBy = sortBy
  ? { [sortBy]: sortDir as "asc" | "desc" }
  : { createdAt: "desc" }   // default sort

const [rows, total] = await Promise.all([
  db.payment.findMany({
    skip: pageIndex * pageSize,
    take: pageSize,
    orderBy,
  }),
  db.payment.count(),
])
```

**Key things:**

- `sorting[0]` — TanStack's `SortingState` is an array to support multi-column sort, but single sort is just index 0
- Reset `pageIndex` to 0 when sort changes, otherwise you might land on a page that no longer exists with the new sort order
- `getSortedRowModel` import can be dropped entirely — it's only needed for client-side sorting
- The `sortBy` value coming from the client is a column `id`, so sanitize/whitelist it server-side before passing to Prisma to avoid injection via crafted requests


## How to use filtering