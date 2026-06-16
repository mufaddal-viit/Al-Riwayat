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
  onSelect,
}: {
  categories: ContributionCategory[];
  active: Filter;
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
              "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {option}
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

  // First contribution flagged featured (or the newest) becomes the hero card.
  const featured = useMemo(
    () => contributions.find((c) => c.featured) ?? contributions[0],
    [contributions],
  );

  const rest = useMemo(
    () => contributions.filter((c) => c !== featured),
    [contributions, featured],
  );

  const visible = useMemo(
    () =>
      active === "All" ? rest : rest.filter((c) => c.category === active),
    [rest, active],
  );

  if (loading) {
    return (
      <div className="space-y-10">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl sm:aspect-[16/9]" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
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
    <div className="space-y-12">
      {featured ? (
        <ContributionCard contribution={featured} featured />
      ) : null}

      {categories.length > 1 ? (
        <FilterChips categories={categories} active={active} onSelect={setActive} />
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
