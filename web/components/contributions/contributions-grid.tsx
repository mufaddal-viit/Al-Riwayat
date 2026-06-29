"use client";

import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listContributionCategories } from "@/lib/content/contributions";
import type { Contribution, ContributionCategory } from "@/types/api";

import { ContributionCard } from "./contribution-card";

type Filter = ContributionCategory | "All";

type ContributionsGridProps = {
  contributions: Contribution[];
  loading?: boolean;
};

function FilterChips({
  categories,
  active,
  counts,
  onSelect,
}: {
  categories: ContributionCategory[];
  active: Filter;
  counts: Record<string, number>;
  onSelect: (filter: Filter) => void;
}) {
  const options: Filter[] = ["All", ...categories];

  return (
    <div
      role="tablist"
      aria-label="Filter contributions by category"
      className="flex flex-wrap gap-2.5"
    >
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(option)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {option}
            <span
              className={cn(
                "tabular-nums",
                isActive ? "text-background/70" : "text-muted-foreground/60",
              )}
            >
              {counts[option] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ContributionsGrid({
  contributions,
  loading = false,
}: ContributionsGridProps) {
  const [active, setActive] = useState<Filter>("All");

  const categories = useMemo(
    () => listContributionCategories(contributions),
    [contributions],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: contributions.length };
    for (const c of contributions) {
      result[c.category] = (result[c.category] ?? 0) + 1;
    }
    return result;
  }, [contributions]);

  const visible = useMemo(
    () =>
      active === "All"
        ? contributions
        : contributions.filter((c) => c.category === active),
    [contributions, active],
  );

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-muted-foreground">
          No contributions published yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.length > 1 ? (
        <FilterChips
          categories={categories}
          active={active}
          counts={counts}
          onSelect={setActive}
        />
      ) : null}

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing in this category yet.
        </p>
      )}
    </div>
  );
}
