"use client";

import { RANGE_OPTIONS, type RangeKey } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";

interface RangeSwitcherProps {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
}

/** Compact pill switcher for the trend time range. */
export function RangeSwitcher({ value, onChange }: RangeSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          aria-pressed={value === option.key}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === option.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
