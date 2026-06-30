"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContributionShareActions } from "@/components/contributions/contribution-share-actions";
import { MarkdownContent } from "@/components/weekly/markdown-content";
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
    <div className="container max-w-[68ch] space-y-6 py-12">
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
      <h1 className="font-heading text-4xl">Article not found</h1>
      <p className="text-muted-foreground">
        This weekly read does not exist or has been removed.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/weekly-riwayat">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Weekly Riwayat
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
    <nav className="mx-auto grid max-w-[68ch] gap-3 sm:grid-cols-2">
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

  return (
    <>
      <ReadingProgress />

      <article className="container space-y-10 py-10 pb-20 sm:py-14 lg:space-y-12">
        <Link
          href="/weekly-riwayat"
          className="mx-auto flex max-w-[68ch] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Weekly Riwayat
        </Link>

        {/* Header */}
        <header className="mx-auto max-w-[68ch] space-y-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Weekly Riwayat
          </p>
          <h1 className="balanced-wrap font-heading text-4xl leading-[1.08] sm:text-5xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="font-heading text-lg italic text-muted-foreground sm:text-xl">
              {article.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
            {formatDate(article.weekOf ?? article.publishedAt) && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDate(article.weekOf ?? article.publishedAt)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime} min read
            </span>
          </div>
        </header>

        <div aria-hidden className="mx-auto h-px max-w-[68ch] bg-border" />

        {/* Body */}
        <div className="mx-auto max-w-[68ch]">
          <MarkdownContent dropCap>{article.body}</MarkdownContent>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mx-auto flex max-w-[68ch] flex-wrap gap-2">
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

        <div aria-hidden className="mx-auto h-px max-w-[68ch] bg-border" />

        <AdjacentNav prev={prev} next={next} />
      </article>
    </>
  );
}
