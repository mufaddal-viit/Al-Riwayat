"use client";

import type { TooltipProps } from "recharts";

/** Themed tooltip shared by the admin charts. */
export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label != null && (
        <p className="mb-1 font-medium text-foreground">{String(label)}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.name}</span>
            <span className="ml-auto font-semibold text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
