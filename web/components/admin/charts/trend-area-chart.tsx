"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimePoint } from "@/lib/admin/analytics";
import { CATEGORICAL } from "./palette";
import { ChartTooltip } from "./chart-tooltip";

export interface TrendSeries {
  key: string;
  label: string;
  color?: string;
}

interface TrendAreaChartProps {
  data: TimePoint[];
  series: TrendSeries[];
  height?: number;
}

/** Multi-series smoothed area chart for weekly activity trends. */
export function TrendAreaChart({
  data,
  series,
  height = 280,
}: TrendAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          {series.map((entry, index) => {
            const color = entry.color ?? CATEGORICAL[index % CATEGORICAL.length];
            return (
              <linearGradient
                key={entry.key}
                id={`fill-${entry.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={36}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip content={<ChartTooltip />} />
        {series.map((entry, index) => {
          const color = entry.color ?? CATEGORICAL[index % CATEGORICAL.length];
          return (
            <Area
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#fill-${entry.key})`}
              activeDot={{ r: 4 }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
