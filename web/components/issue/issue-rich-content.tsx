"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Maximize2 } from "lucide-react";

import type { Magazine } from "@/types/api";
import type { IssueContent } from "@/lib/content/issues";
import { PageReactionBar } from "@/components/issue/page-reaction-bar";

const FLIPBOOK_IFRAME_ID = "issue-flipbook";

interface IssueRichContentProps {
  magazine?: Magazine;
  issue?: IssueContent;
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

export function IssueRichContent({
  magazine,
  issue,
  issuePath,
}: IssueRichContentProps) {
  const article = issue ?? magazine;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!article) return;
    if (!article.flipbookUrl.trim()) return;
    const start = readPageFromUrl();
    setPage(start);
    if (start > 1) {
      requestAnimationFrame(() => {
        const iframe = document.getElementById(
          FLIPBOOK_IFRAME_ID,
        ) as HTMLIFrameElement | null;
        if (iframe) iframe.src = `${article.flipbookUrl}#page/${start}`;
      });
    }
  }, [article]);

  if (!article) return null;

  const resolvedIssuePath = issuePath ?? `/issue/${article.slug}`;
  const hasFlipbook = article.flipbookUrl.trim().length > 0;

  return (
    <section>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/88 shadow-editorial backdrop-blur-xl">
          <div className="border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 flex-1 truncate font-heading text-xl sm:text-2xl">
                {article.title}
              </h2>

              {hasFlipbook ? (
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
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/60 p-2 text-sm font-medium text-muted-foreground opacity-70 sm:px-4 sm:py-2"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Open Full Screen</span>
                </span>
              )}
            </div>

            <div className="mt-3">
              <PageReactionBar
                issueSlug={article.slug}
                issueTitle={article.title}
                issuePath={resolvedIssuePath}
                page={page}
              />
            </div>
          </div>

          {hasFlipbook ? (
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
          ) : (
            <div className="flex min-h-[280px] w-full items-center justify-center bg-background px-6 py-12 text-center">
              <div className="max-w-md space-y-2">
                <p className="font-heading text-2xl">Flipbook coming soon</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The full digital flipbook for this issue has not been added yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
