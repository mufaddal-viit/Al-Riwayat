"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkline } from "./charts/sparkline";

const numberFormatter = new Intl.NumberFormat("en");

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  detail?: string;
  spark?: number[];
  /** Highlight badge, e.g. a pending count needing attention. */
  badge?: { text: string; tone: "warning" | "danger" | "info" } | null;
  accentColor?: string;
}

const toneClasses: Record<string, string> = {
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-primary/15 text-primary",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  spark,
  badge,
  accentColor = "var(--primary)",
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <Icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <p className="truncate text-sm text-muted-foreground">{label}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
              {numberFormatter.format(value)}
            </p>
          </div>

          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                toneClasses[badge.tone],
              )}
            >
              {badge.text}
            </span>
          )}
        </div>

        {spark && spark.length > 1 && (
          <div className="mt-3 -mb-1">
            <Sparkline data={spark} color={accentColor} height={36} />
          </div>
        )}

        {detail && (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
        )}
      </CardContent>
    </Card>
  );
}
