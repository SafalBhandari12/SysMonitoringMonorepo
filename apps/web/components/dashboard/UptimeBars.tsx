"use client";

type UptimeItem = {
  date: string;
  up: boolean;
  upCount: number;
  totalCount: number;
  hasData?: boolean;
};

export default function UptimeBars(props: {
  days?: number;
  cellWidth?: number;
  cellHeight?: number;
  maxRows?: number;
  method?: string;
  path?: string;
  groupName?: string;
  showLabel?: boolean;
  showHeader?: boolean;
  currentUptime?: number | null;
  initialData?: UptimeItem[] | null;
}) {
  const {
    days = 90,
    cellWidth = 3,
    cellHeight = 35,
    maxRows = 3,
    method,
    path,
    groupName,
    showLabel = true,
    showHeader = true,
    currentUptime,
    initialData = [],
  } = props;

  const data = initialData ?? [];

  const gap = 4;
  const maxHeight = maxRows * cellHeight + Math.max(0, (maxRows - 1) * gap);

  return (
    <div className="max-w-full min-w-0 overflow-x-hidden">
      {showHeader && (
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {method && (
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-medium">
                {method}
              </span>
            )}
            {path && (
              <code className="text-sm truncate text-muted-foreground">
                {path}
              </code>
            )}
            {groupName && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground ml-2">
                {groupName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {(currentUptime ?? 0).toFixed(1)}%
            </div>
            {showLabel ? (
              <div className="text-xs text-muted-foreground">
                Last {days} days
              </div>
            ) : null}
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No uptime data for the last {days} days.
        </div>
      ) : null}

      <div
        className="flex flex-wrap items-center justify-between content-start gap-[1px] max-w-full min-w-0 overflow-hidden"
        style={{ maxHeight }}
      >
        {data.map((d) => {
          const isMissing = d.hasData === false;
          const bgClass = isMissing
            ? "bg-gray-200 dark:bg-gray-800"
            : d.up
              ? "bg-emerald-500"
              : d.upCount > 0 
                ? "bg-amber-500" 
                : "bg-red-500";

          return (
            <div
              key={d.date}
              title={`${d.date} — ${isMissing ? "NO DATA" : d.up ? "UP" : "DOWN"} (${d.upCount}/${d.totalCount})`}
              className={`${bgClass} rounded-sm`}
              style={{
                width: cellWidth,
                height: cellHeight,
                flex: `0 1 ${cellWidth}px`,
                minWidth: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
