"use client";

type UptimeItem = {
  date: string;
  up: boolean;
  upCount: number;
  totalCount: number;
};

export default function UptimeBars(props: {
  days?: number;
  cellWidth?: number;
  cellHeight?: number;
  maxRows?: number;
  method?: string;
  path?: string;
  groupName?: string;
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
    initialData = [],
  } = props;

  const data = initialData ?? [];

  const gap = 4;
  const maxHeight = maxRows * cellHeight + Math.max(0, (maxRows - 1) * gap);

  return (
    <div className="max-w-full min-w-0 overflow-x-hidden">
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
        <div className="text-xs text-muted-foreground">Last {days} days</div>
      </div>

      {data.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No uptime data for the last {days} days.
        </div>
      ) : null}

      <div
        className="flex flex-wrap items-center content-start gap-1 max-w-full min-w-0 overflow-y-auto"
        style={{ maxHeight }}
      >
        {data.map((d) => (
          <div
            key={d.date}
            title={`${d.date} — ${d.up ? "UP" : "DOWN"} (${d.upCount}/${d.totalCount})`}
            className={`${d.up ? "bg-green-600" : "bg-red-600"} rounded-sm`}
            style={{
              width: cellWidth,
              height: cellHeight,
              flex: `0 1 ${cellWidth}px`,
              minWidth: 4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
