"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategorySlice } from "@/lib/admin/analytics";
import { CATEGORICAL } from "./palette";
import { ChartTooltip } from "./chart-tooltip";

interface StatusDonutChartProps {
  data: CategorySlice[];
  height?: number;
  colorFor?: (label: string, index: number) => string;
  /** Big number shown in the donut center. */
  centerValue?: number | string;
  centerLabel?: string;
}

/** Donut chart with an optional centered total, for status breakdowns. */
export function StatusDonutChart({
  data,
  height = 240,
  colorFor,
  centerValue,
  centerLabel,
}: StatusDonutChartProps) {
  const hasData = data.some((slice) => slice.value > 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={hasData ? data : [{ label: "No data", value: 1 }]}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={hasData ? 2 : 0}
            strokeWidth={0}
          >
            {(hasData ? data : [{ label: "No data", value: 1 }]).map(
              (slice, index) => (
                <Cell
                  key={slice.label}
                  fill={
                    hasData
                      ? colorFor
                        ? colorFor(slice.label, index)
                        : CATEGORICAL[index % CATEGORICAL.length]
                      : "var(--muted)"
                  }
                />
              ),
            )}
          </Pie>
          {hasData && <Tooltip content={<ChartTooltip />} />}
        </PieChart>
      </ResponsiveContainer>

      {centerValue !== undefined && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none text-foreground">
            {centerValue}
          </span>
          {centerLabel && (
            <span className="mt-1 text-xs text-muted-foreground">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
