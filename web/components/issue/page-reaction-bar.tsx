"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getAnonymousReaderId } from "@/lib/anonymous-reader";
import {
  clearPageBookmark,
  getPageBookmark,
  savePageBookmark,
} from "@/lib/page-bookmark";
import {
  clearPageReaction,
  getOwnReaction,
  setPageReaction,
  subscribePageReactionCounts,
  type PageReactionCounts,
  type ReactionKey,
} from "@/services/pageReactionService";

interface PageReactionBarProps {
  issueSlug: string;
  issueTitle: string;
  issuePath: string;
  flipbookIframeId: string;
  flipbookBaseUrl: string;
  totalPages?: number;
}

interface ReactionDef {
  key: ReactionKey;
  emoji: string;
  label: string;
}

const REACTIONS: ReactionDef[] = [
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "think", emoji: "🤔", label: "Think" },
  { key: "bookmark", emoji: "🔖", label: "Bookmark" },
  { key: "inspire", emoji: "✨", label: "Inspire" },
];

const EMPTY_COUNTS: PageReactionCounts = {
  love: 0,
  wow: 0,
  think: 0,
  bookmark: 0,
  inspire: 0,
};

export function PageReactionBar({
  issueSlug,
  issueTitle,
  issuePath,
  flipbookIframeId,
  flipbookBaseUrl,
  totalPages,
}: PageReactionBarProps) {
  const [page, setPage] = useState(1);
  const [readerId, setReaderId] = useState<string>("");
  const [ownReaction, setOwnReaction] = useState<ReactionKey | null>(null);
  const [counts, setCounts] = useState<PageReactionCounts>(EMPTY_COUNTS);
  const [pending, setPending] = useState<ReactionKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const ownReactionToken = useRef(0);

  useEffect(() => {
    setReaderId(getAnonymousReaderId());
    const existing = getPageBookmark(issueSlug);
    if (existing) setBookmarkedPage(existing.page);

    // Honor ?page=N from the URL (used by the return-visit toast CTA)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("page");
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed) && parsed >= 1) {
        const safe = totalPages ? Math.min(parsed, totalPages) : parsed;
        setPage(safe);
        // Defer iframe nudge to the next tick so the iframe is mounted
        requestAnimationFrame(() => {
          const iframe = document.getElementById(
            flipbookIframeId,
          ) as HTMLIFrameElement | null;
          if (iframe) iframe.src = `${flipbookBaseUrl}#page/${safe}`;
        });
      }
    }
  }, [issueSlug, flipbookIframeId, flipbookBaseUrl, totalPages]);

  // Live counts for the currently selected page
  useEffect(() => {
    setCounts(EMPTY_COUNTS);
    const unsub = subscribePageReactionCounts({ issueSlug, page }, setCounts);
    return unsub;
  }, [issueSlug, page]);

  // Reader's own reaction on this page
  useEffect(() => {
    if (!readerId) return;
    const token = ++ownReactionToken.current;
    setOwnReaction(null);
    getOwnReaction({ readerId, issueSlug, page })
      .then((r) => {
        if (token === ownReactionToken.current) setOwnReaction(r);
      })
      .catch(() => {
        // non-fatal — UI still lets them react
      });
  }, [readerId, issueSlug, page]);

  const navigateFlipbook = useCallback(
    (nextPage: number) => {
      const iframe = document.getElementById(
        flipbookIframeId,
      ) as HTMLIFrameElement | null;
      if (!iframe) return;
      // Heyzine supports the #page/N hash; rewriting src is the most
      // reliable cross-origin way to nudge it.
      iframe.src = `${flipbookBaseUrl}#page/${nextPage}`;
    },
    [flipbookIframeId, flipbookBaseUrl],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage < 1) return;
      if (totalPages && nextPage > totalPages) return;
      setPage(nextPage);
      navigateFlipbook(nextPage);
    },
    [navigateFlipbook, totalPages],
  );

  function handleSavePage() {
    const alreadyOnThisPage = bookmarkedPage === page;
    if (alreadyOnThisPage) {
      clearPageBookmark(issueSlug);
      setBookmarkedPage(null);
      return;
    }
    savePageBookmark({
      issueSlug,
      issueTitle,
      issuePath,
      page,
    });
    setBookmarkedPage(page);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1600);
  }

  async function handleReact(reaction: ReactionKey) {
    if (!readerId || pending) return;
    setError(null);
    setPending(reaction);
    const isToggleOff = ownReaction === reaction;
    // Optimistic update
    const previous = ownReaction;
    setOwnReaction(isToggleOff ? null : reaction);
    setCounts((prev) => {
      const next = { ...prev };
      if (previous) next[previous] = Math.max(0, next[previous] - 1);
      if (!isToggleOff) next[reaction] = next[reaction] + 1;
      return next;
    });
    try {
      if (isToggleOff) {
        await clearPageReaction({ readerId, issueSlug, page });
      } else {
        await setPageReaction({ readerId, issueSlug, page, reaction });
      }
    } catch {
      // Roll back optimistic update
      setOwnReaction(previous);
      setCounts((prev) => {
        const next = { ...prev };
        if (!isToggleOff) next[reaction] = Math.max(0, next[reaction] - 1);
        if (previous) next[previous] = next[previous] + 1;
        return next;
      });
      setError("Couldn't save — try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3 sm:bottom-5">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border/60",
          "bg-card/95 px-3 py-2.5 shadow-editorial backdrop-blur-xl sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3",
        )}
        role="region"
        aria-label="Page reactions"
      >
        {/* Page stepper */}
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-sm",
              "transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40",
            )}
            aria-label="Previous page"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 1) {
                  goToPage(v);
                }
              }}
              className={cn(
                "h-7 w-12 rounded-md border border-border/70 bg-background/80 px-1.5 text-center text-sm font-semibold tracking-normal text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-foreground/20",
              )}
              aria-label="Current page number"
            />
            {totalPages ? (
              <span className="text-muted-foreground/80">/ {totalPages}</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={totalPages ? page >= totalPages : false}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-sm",
              "transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40",
            )}
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border/70 sm:block" />

        {/* Save page */}
        <button
          type="button"
          onClick={handleSavePage}
          aria-pressed={bookmarkedPage === page}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            bookmarkedPage === page
              ? "border-foreground/60 bg-foreground/10 text-foreground"
              : "border-border/70 bg-background/70 text-muted-foreground hover:bg-background hover:text-foreground",
          )}
          title={
            bookmarkedPage === page
              ? "Remove saved page"
              : "Save this page so you can come back later"
          }
        >
          <span aria-hidden="true">
            {bookmarkedPage === page ? "★" : "☆"}
          </span>
          <span>
            {justSaved
              ? "Saved!"
              : bookmarkedPage === page
                ? `Saved p.${bookmarkedPage}`
                : "Save my page"}
          </span>
        </button>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-border/70 sm:block" />

        {/* Reactions */}
        <div className="flex flex-1 items-center justify-between gap-1 sm:justify-end sm:gap-2">
          {REACTIONS.map((r) => {
            const active = ownReaction === r.key;
            const count = counts[r.key];
            const isPending = pending === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleReact(r.key)}
                disabled={!readerId || isPending}
                aria-pressed={active}
                aria-label={`${r.label}${count ? ` (${count})` : ""}`}
                title={r.label}
                className={cn(
                  "group inline-flex min-w-[44px] items-center gap-1 rounded-full border px-2 py-1 text-sm transition-all",
                  active
                    ? "border-foreground/60 bg-foreground/10 text-foreground"
                    : "border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground",
                  isPending && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "text-base leading-none transition-transform",
                    active && "scale-110",
                  )}
                >
                  {r.emoji}
                </span>
                <span className="text-[11px] font-semibold tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="pointer-events-auto absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
