"use client";

import { useEffect, useState } from "react";

import type { Magazine, ApiResponse } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { ArticleStructuredData } from "@/components/issue/article-structured-data";
import { IssueRichContent } from "@/components/issue/issue-rich-content";
import { IssueShareActions } from "@/components/issue/issue-share-actions";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function IssueSkeleton() {
  return (
    <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10 lg:py-14">
      <Skeleton className="h-10 w-2/3 rounded-2xl" />
      <Skeleton className="h-5 w-1/3 rounded-xl" />
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-5/6 rounded-xl" />
        <Skeleton className="h-4 w-4/5 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Not found view ───────────────────────────────────────────────────────────

function IssueNotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-heading text-4xl">Issue not found</h1>
      <p className="text-muted-foreground">
        This issue does not exist or has been removed.
      </p>
    </div>
  );
}

// ─── Client component ─────────────────────────────────────────────────────────

export function IssuePageClient({ slug }: { slug: string }) {
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [status, setStatus]     = useState<"loading" | "found" | "not_found" | "error">("loading");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    apiClient
      .get<ApiResponse<Magazine>>(ENDPOINTS.magazine.byId(slug))
      .then(({ data }) => {
        if (!cancelled) {
          setMagazine(data.data);
          setStatus("found");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AppError && err.status === 404) {
          setStatus("not_found");
        } else {
          setStatus("error");
        }
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (status === "loading") return <IssueSkeleton />;
  if (status === "not_found" || status === "error" || !magazine) return <IssueNotFound />;

  return (
    <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10 lg:py-14">
      <ArticleStructuredData magazine={magazine} />
      <IssueShareActions />
      <IssueRichContent magazine={magazine} />
      <NewsletterPreviewSection />
    </div>
  );
}
