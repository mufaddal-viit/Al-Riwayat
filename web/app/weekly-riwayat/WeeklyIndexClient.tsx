"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { weeklyCopy, weeklyIntro } from "@/lib/content/weekly";
import { useWeeklyArticles } from "@/hooks/useWeekly";
import type { WeeklyArticle } from "@/types/api";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function articleDate(article: WeeklyArticle): Date {
  return new Date(article.weekOf ?? article.publishedAt ?? Date.now());
}

interface MonthGroup {
  key: string;
  label: string;
  articles: WeeklyArticle[];
}

function groupByMonth(articles: WeeklyArticle[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const article of articles) {
    const date = articleDate(article);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!groups.has(key)) {
      groups.set(key, { key, label: monthFormatter.format(date), articles: [] });
    }
    groups.get(key)!.articles.push(article);
  }
  return Array.from(groups.values());
}

function ArticleRow({ article }: { article: WeeklyArticle }) {
  return (
    <Link
      href={`/weekly-riwayat/${article.slug}`}
      className="group block border-t border-border/60 py-6 transition-colors first:border-t-0 sm:py-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-8">
        {/* Date rail */}
        <span className="shrink-0 pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:w-24">
          {dayFormatter.format(articleDate(article))}
        </span>

        {/* Main */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-heading text-2xl leading-tight balanced-wrap transition-colors group-hover:text-primary sm:text-3xl">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="font-heading text-base italic text-muted-foreground sm:text-lg">
              {article.subtitle}
            </p>
          )}
          <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span>{article.author}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
            </span>
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Affordance */}
        <span className="hidden shrink-0 items-center gap-1.5 self-center text-sm font-medium text-primary transition-all duration-200 group-hover:gap-2.5 sm:flex">
          Read
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function WeeklyIndexClient() {
  const { articles, loading } = useWeeklyArticles();
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) a.tags.forEach((t) => set.add(t));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filtered = useMemo(
    () =>
      activeTag === "All"
        ? articles
        : articles.filter((a) => a.tags.includes(activeTag)),
    [articles, activeTag],
  );

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <div className="container max-w-5xl space-y-12 py-10 pb-20 sm:py-14 lg:space-y-16">
      {/* Masthead */}
      <header className="space-y-5">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-7 bg-primary" />
          {weeklyIntro.eyebrow}
        </p>
        <h1 className="balanced-wrap max-w-3xl font-heading text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          {weeklyIntro.title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {weeklyIntro.description}
        </p>
      </header>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {["All", ...tags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                activeTag === tag
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Index */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-muted-foreground">{weeklyCopy.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-14">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="sticky top-[72px] z-10 -mx-1 bg-background/80 px-1 py-2 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                {group.label}
              </h2>
              <div>
                {group.articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
