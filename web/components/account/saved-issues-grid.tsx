"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useProfile } from "@/context/profile-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiResponse, Magazine } from "@/types/api";

interface SavedIssuesGridProps {
  field: "bookmarks" | "favourites";
  emptyTitle: string;
  emptyHint: string;
}

export function SavedIssuesGrid({
  field,
  emptyTitle,
  emptyHint,
}: SavedIssuesGridProps) {
  const { profile } = useProfile();
  const [issues, setIssues] = useState<Magazine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slugs = profile?.[field] ?? [];
  const slugKey = slugs.join(",");

  useEffect(() => {
    if (!profile) return;
    if (slugs.length === 0) {
      setIssues([]);
      return;
    }

    let cancelled = false;
    setIssues(null);
    setError(null);

    // Hydrate slugs by fetching the published list once and filtering.
    // Keeps things simple — no per-slug GET fan-out.
    apiClient
      .get<ApiResponse<Magazine[]>>(ENDPOINTS.magazine.list)
      .then(({ data }) => {
        if (cancelled) return;
        const set = new Set(slugs);
        // Preserve user's order (most-recently-added last → reverse for newest first)
        const byOrder = [...slugs].reverse();
        const lookup = new Map(data.data.map((m) => [m.slug, m]));
        setIssues(
          byOrder
            .map((slug) => lookup.get(slug))
            .filter((m): m is Magazine => Boolean(m && set.has(m.slug))),
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load issues.");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugKey, profile]);

  if (!profile || issues === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-card/40">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-medium">{emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {issues.map((issue) => (
        <Link
          key={issue.slug}
          href={`/${issue.slug}`}
          className="group block focus-visible:outline-none"
        >
          <Card className="overflow-hidden border-border/60 bg-card/80 shadow-editorial transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary/60">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[80px_1fr]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border/60 bg-muted">
                <Image
                  src={issue.coverImageUrl}
                  alt={issue.coverImageAlt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Issue {issue.issueNumber}
                </p>
                <h3 className="font-heading text-lg leading-snug">
                  {issue.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {issue.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
