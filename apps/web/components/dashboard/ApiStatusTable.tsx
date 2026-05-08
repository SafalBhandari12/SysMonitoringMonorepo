import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type ApiData = {
  id: string;
  name: string;
  status: "UP" | "DOWN";
  uptime: number | null;
  p90: number | null;
  p99: number | null;
};

export function ApiStatusTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Uptime</TableHead>
            <TableHead className="text-right">P90</TableHead>
            <TableHead className="text-right">P99</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40 max-w-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-14" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-14" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-14" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ApiStatusTableContent({ apis }: { apis: ApiData[] }) {
  const formatLatency = (value: number | null) =>
    value === null ? "N/A" : `${Math.round(value)} ms`;
  const formatUptime = (value: number | null) =>
    value === null ? "N/A" : `${value.toFixed(2)}%`;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Uptime</TableHead>
            <TableHead className="text-right">P90</TableHead>
            <TableHead className="text-right">P99</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apis.length > 0 ? (
            apis.map((api) => (
              <TableRow key={api.id}>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        api.status === "UP" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {api.status === "UP" ? "Up" : "Down"}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{api.name}</TableCell>
                <TableCell className="text-right">
                  {formatUptime(api.uptime)}
                </TableCell>
                <TableCell className="text-right">
                  {formatLatency(api.p90)}
                </TableCell>
                <TableCell className="text-right">
                  {formatLatency(api.p99)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No API metrics yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function ApiStatusTable({ apis }: { apis: ApiData[] }) {
  return <ApiStatusTableContent apis={apis} />;
}
