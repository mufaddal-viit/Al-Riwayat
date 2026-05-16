"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Maximize2 } from "lucide-react";

import type { Magazine } from "@/types/api";
import { issueOneArticle } from "@/lib/content/issue-content";
import { PageReactionBar } from "@/components/issue/page-reaction-bar";

const FLIPBOOK_IFRAME_ID = "issue-flipbook";

interface IssueRichContentProps {
  magazine?: Magazine;
  /** Path on this site that renders this issue — used so bookmarks deep-link back. */
  issuePath?: string;
}

/** Read the current issue page from the URL (?page=N). Defaults to 1. */
function readPageFromUrl(): number {
  if (typeof window === "undefined") return 1;
  const raw = new URLSearchParams(window.location.search).get("page");
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}

export function IssueRichContent({ magazine, issuePath }: IssueRichContentProps) {
  const article = magazine || issueOneArticle;
  // Default: Issue 1 has its own /issue-1 route; everything else uses /issue/[slug]
  const resolvedIssuePath =
    issuePath ??
    (article.slug === issueOneArticle.slug
      ? `/${article.slug}`
      : `/issue/${article.slug}`);

  // The page that reactions/bookmark attach to — honors ?page=N deep links.
  const [page, setPage] = useState(1);

  useEffect(() => {
    const start = readPageFromUrl();
    setPage(start);
    if (start > 1) {
      // Nudge the flipbook to the deep-linked page once it has mounted.
      requestAnimationFrame(() => {
        const iframe = document.getElementById(
          FLIPBOOK_IFRAME_ID,
        ) as HTMLIFrameElement | null;
        if (iframe) iframe.src = `${article.flipbookUrl}#page/${start}`;
      });
    }
  }, [article.flipbookUrl]);

  return (
    <section>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/88 shadow-editorial backdrop-blur-xl">
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <div className="border-b border-border/60 px-5 py-4 sm:px-6">
            {/* Row 1 — title (single line on mobile) + Open Full Screen */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 flex-1 truncate font-heading text-xl sm:text-2xl">
                {article.title}
              </h2>

              {/* Mobile: icon only. Desktop: icon + label. */}
              <Link
                href={article.flipbookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open full screen"
                title="Open full screen"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/80 p-2 text-sm font-medium text-foreground transition-colors hover:bg-background sm:px-4 sm:py-2"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Open Full Screen</span>
              </Link>
            </div>

            {/* Row 2 — reaction + save UI */}
            <div className="mt-3">
              <PageReactionBar
                issueSlug={article.slug}
                issueTitle={article.title}
                issuePath={resolvedIssuePath}
                page={page}
              />
            </div>
          </div>

          {/* ─── Flipbook ───────────────────────────────────────────────── */}
          <div className="relative h-[72svh] min-h-[540px] w-full bg-background sm:h-[78svh] sm:min-h-[720px] lg:h-[860px] xl:h-[940px]">
            <iframe
              id={FLIPBOOK_IFRAME_ID}
              src={article.flipbookUrl}
              title={`${article.title} flipbook`}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
