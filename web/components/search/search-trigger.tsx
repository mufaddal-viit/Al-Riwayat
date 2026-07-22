"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSearch } from "./search-provider";

/**
 * Opens site search. Renders as a bare icon on small screens and as a quiet
 * pill (with the ⌘K hint) once there is room for it.
 */
export function SearchTrigger({ className }: { className?: string }) {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "w-9 justify-center lg:w-auto lg:justify-start lg:border lg:border-border/60 lg:bg-muted/30 lg:px-3 lg:hover:bg-muted/60",
        className,
      )}
    >
      <Search className="h-[18px] w-[18px] shrink-0" />
      <span className="hidden text-xs lg:inline">Search</span>
      <kbd className="ml-1 hidden rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80 lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}
