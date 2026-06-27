"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Consistent container for a titled chart with optional header action. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={`border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm ${className ?? ""}`}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-heading text-lg">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ChartLegendProps {
  items: { label: string; color: string; value?: number | string }[];
}

/** Inline legend shared by donut/bar charts. */
export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="ml-auto font-semibold text-foreground">
              {item.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
