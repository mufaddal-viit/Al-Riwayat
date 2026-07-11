"use client";

import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Small pill segmented control used for block layout options. */
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5"
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
