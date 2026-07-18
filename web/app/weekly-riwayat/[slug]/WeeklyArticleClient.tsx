"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContributionShareActions } from "@/components/contributions/contribution-share-actions";
import { WeeklyBody } from "@/components/weekly/blocks/weekly-body";
import { AdSlot } from "@/components/ads/ad-slot";
import { weeklyCopy } from "@/lib/content/weekly";
import { useWeeklyArticle, useWeeklyArticles } from "@/hooks/useWeekly";
import type { WeeklyArticle } from "@/types/api";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

/** Thin top bar that fills as the reader scrolls through the article. */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="container max-w-[75ch] space-y-6 py-12">
      <Skeleton className="h-5 w-28 rounded-full" />
      <Skeleton className="h-12 w-3/4 rounded-xl" />
      <Skeleton className="h-5 w-1/2 rounded-xl" />
      <div className="space-y-3 pt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-heading text-4xl">{weeklyCopy.notFoundTitle}</h1>
      <p className="text-muted-foreground">{weeklyCopy.notFoundBody}</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/weekly-riwayat">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {weeklyCopy.articleEyebrow}
        </Link>
      </Button>
    </div>
  );
}

function AdjacentNav({
  prev,
  next,
}: {
  prev?: WeeklyArticle;
  next?: WeeklyArticle;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="mx-auto grid w-full max-w-[75ch] gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/weekly-riwayat/${prev.slug}`}
          className="group rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3" /> Previous
          </span>
          <p className="mt-1 font-heading text-base leading-snug group-hover:text-primary">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/weekly-riwayat/${next.slug}`}
          className="group rounded-2xl border border-border bg-card/60 p-4 text-right transition-colors hover:border-primary/40"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="h-3 w-3" />
          </span>
          <p className="mt-1 font-heading text-base leading-snug group-hover:text-primary">
            {next.title}
          </p>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function WeeklyArticleClient({ slug }: { slug: string }) {
  const { article, status } = useWeeklyArticle(slug);
  const { articles } = useWeeklyArticles();

  // Prev/next within the published list (sorted newest-first by the API).
  const { prev, next } = useMemo(() => {
    if (!article || articles.length === 0) return {};
    const index = articles.findIndex((a) => a.slug === article.slug);
    if (index === -1) return {};
    return {
      next: index > 0 ? articles[index - 1] : undefined,
      prev: index < articles.length - 1 ? articles[index + 1] : undefined,
    };
  }, [article, articles]);

  if (status === "loading") return <ArticleSkeleton />;
  if (status === "not_found" || status === "error" || !article) {
    return <NotFound />;
  }

  const dateLabel = formatDate(article.weekOf ?? article.publishedAt);

  return (
    <>
      <ReadingProgress />

      <article className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10">
        <Link
          href="/weekly-riwayat"
          className="mx-auto -my-2 flex min-h-[44px] w-full max-w-[75ch] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {weeklyCopy.articleEyebrow}
        </Link>

        {/* Header — compact, left-aligned editorial masthead */}
        <header className="mx-auto w-full max-w-[75ch] space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {weeklyCopy.articleEyebrow}
          </p>
          <h1 className="balanced-wrap font-heading text-[2rem] leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="font-heading text-lg italic text-muted-foreground sm:text-xl">
              {article.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
            {dateLabel && (
              <>
                <span aria-hidden className="opacity-50">·</span>
                <span>{dateLabel}</span>
              </>
            )}
            <span aria-hidden className="opacity-50">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime} min read
            </span>
          </div>
        </header>

        <div aria-hidden className="mx-auto h-px w-full max-w-[75ch] bg-border" />

        {/* Body */}
        <WeeklyBody body={article.body} />

        {/* Sponsored slot after the article (renders nothing when empty) */}
        <AdSlot placement="weekly-after" />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mx-auto flex w-full max-w-[75ch] flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <ContributionShareActions title={article.title} />

        <div aria-hidden className="mx-auto h-px w-full max-w-[75ch] bg-border" />

        <AdjacentNav prev={prev} next={next} />
      </article>
    </>
  );
}
