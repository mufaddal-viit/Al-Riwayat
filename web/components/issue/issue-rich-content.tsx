import Link from "next/link";
import { Maximize2 } from "lucide-react";

import type { Magazine } from "@/types/api";
import {
  formatIssuePublishedAt,
  issueOneArticle,
} from "@/lib/content/issue-content";

export function IssueRichContent({ magazine }: { magazine?: Magazine }) {
  const article = magazine || issueOneArticle;
  const publishedAt = formatIssuePublishedAt(article.publishedAt);
  const readerLabel = `Open ${article.title} in full screen`;

  return (
    <section
      aria-label={`${article.title} reader`}
      className="space-y-7 sm:space-y-10"
    >
      {/* Editorial header — matches About / Mission / Contact eyebrow pattern */}
      <header className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
        <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary sm:text-[11px]">
          <span aria-hidden className="h-px w-7 bg-primary sm:w-10" />
          Issue {article.issueNumber} · {publishedAt}
        </p>

        <h2 className="balanced-wrap font-heading text-3xl leading-[1.05] sm:text-4xl lg:text-5xl xl:text-6xl">
          {article.title}
        </h2>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
          {article.summary}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
          <span>By {article.author}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>Flipbook · long-form</span>
        </div>
      </header>

      {/* Reader — edge-to-edge on mobile (-mx-4 cancels container px-4), */}
      {/* contained + softly rounded on sm+. No heavy borders.            */}
      <div className="relative -mx-4 sm:mx-auto sm:max-w-5xl">
        <Link
          href={article.flipbookUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={readerLabel}
          className="group absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/80 shadow-sm ring-1 ring-border/60 backdrop-blur-md transition-colors hover:bg-background hover:text-foreground sm:right-4 sm:top-4 sm:px-4 sm:text-[11px]"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Full Screen</span>
        </Link>

        <div className="h-[78svh] min-h-[520px] w-full overflow-hidden bg-background sm:min-h-[680px] sm:rounded-2xl sm:shadow-lifted lg:h-[860px] xl:h-[940px]">
          <iframe
            src={article.flipbookUrl}
            title={`${article.title} flipbook`}
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        </div>
      </div>

      {/* Secondary fullscreen access — text link for users who scrolled past */}
      <div className="mx-auto flex max-w-3xl items-center justify-center">
        <Link
          href={article.flipbookUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={readerLabel}
          className="inline-flex items-center gap-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground"
        >
          <Maximize2 className="h-3 w-3" aria-hidden />
          Open in full screen reader
        </Link>
      </div>
    </section>
  );
}
