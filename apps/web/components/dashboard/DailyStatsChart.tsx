"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DashboardMetric = "p90" | "p99" | "uptime";
export type DashboardRegion = "IN" | "KR";

type DailyStatsChartPoint = {
  label: string;
  tick: string;
  value: number;
  fill: string;
};

const metricLabels: Record<DashboardMetric, string> = {
  p90: "P90 response time",
  p99: "P99 response time",
  uptime: "Uptime",
};

const metricUnits: Record<DashboardMetric, string> = {
  p90: "ms",
  p99: "ms",
  uptime: "%",
};

const chartConfig = {
  value: {
    label: "Daily stat",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DailyStatsChart({
  data,
  hasStats,
  metric,
  region,
}: {
  data: DailyStatsChartPoint[];
  hasStats: boolean;
  metric: DashboardMetric;
  region: DashboardRegion;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const unit = metricUnits[metric];
  const visibleTicks = data
    .filter((point) => point.tick)
    .map((point) => point.label);

  const updateFilter = (key: "metric" | "region", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-normal text-foreground">
            Average response time / daily stats
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Last 90 days for {region === "KR" ? "KR (SG proxy)" : "IN"}.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={region}
            onValueChange={(value) => updateFilter("region", value)}
          >
            <SelectTrigger className="h-9 w-full sm:w-28">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN">IN</SelectItem>
              <SelectItem value="KR">KR</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={metric}
            onValueChange={(value) => updateFilter("metric", value)}
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p90">P90 latency</SelectItem>
              <SelectItem value="p99">P99 latency</SelectItem>
              <SelectItem value="uptime">Uptime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 h-[280px]">
        {hasStats ? (
          <ChartContainer config={chartConfig} className="h-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 8, right: 24, left: 24, bottom: 12 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                ticks={visibleTicks}
                padding={{ left: 18, right: 18 }}
                tickFormatter={(value) =>
                  data.find((point) => point.label === value)?.tick ?? ""
                }
                className="text-[10px] uppercase text-muted-foreground"
              />
              <YAxis hide domain={[0, "dataMax"]} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.32 }}
                content={
                  <ChartTooltipContent
                    valueFormatter={(value) =>
                      `${Number(value).toFixed(metric === "uptime" ? 2 : 0)} ${unit}`
                    }
                  />
                }
              />
              <Bar
                dataKey="value"
                name={metricLabels[metric]}
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              >
                {data.map((point) => (
                  <Cell key={point.label} fill={point.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/30 text-center">
            <div>
              <p className="text-sm font-medium">No daily stats yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Data will appear here after the daily worker aggregates checks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
