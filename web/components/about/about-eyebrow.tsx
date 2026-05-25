import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AboutEyebrowProps = {
  children: ReactNode;
  className?: string;
  lineClassName?: string;
};

export function AboutEyebrow({
  children,
  className,
  lineClassName,
}: AboutEyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-px w-10 shrink-0 bg-primary", lineClassName)}
      />
      {children}
    </p>
  );
}
