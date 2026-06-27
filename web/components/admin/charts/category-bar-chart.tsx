"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategorySlice } from "@/lib/admin/analytics";
import { CATEGORICAL } from "./palette";
import { ChartTooltip } from "./chart-tooltip";

interface CategoryBarChartProps {
  data: CategorySlice[];
  height?: number;
  /** Optional explicit colors keyed by slice label. */
  colorFor?: (label: string, index: number) => string;
  layout?: "horizontal" | "vertical";
}

/** Bar chart for category / breakdown counts. */
export function CategoryBarChart({
  data,
  height = 260,
  colorFor,
  layout = "horizontal",
}: CategoryBarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 8, right: 12, bottom: 0, left: isVertical ? 8 : -16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.5}
          horizontal={!isVertical}
          vertical={isVertical}
        />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={96}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
          </>
        )}
        <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.3 }} content={<ChartTooltip />} />
        <Bar dataKey="value" name="Count" radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
          {data.map((slice, index) => (
            <Cell
              key={slice.label}
              fill={
                colorFor
                  ? colorFor(slice.label, index)
                  : CATEGORICAL[index % CATEGORICAL.length]
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
