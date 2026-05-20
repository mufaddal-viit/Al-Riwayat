"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAnonymousReaderId } from "@/lib/anonymous-reader";
import { REACTION_ICONS } from "@/config/reaction-icons";
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
  EMPTY_REACTION_COUNTS,
  type PageReactionCounts,
  type ReactionKey,
} from "@/services/pageReactionService";

interface PageReactionBarProps {
  issueSlug: string;
  issueTitle: string;
  issuePath: string;
  /** The issue page these reactions apply to. */
  page: number;
}

/**
 * Seamless reaction strip — sits inline beneath the flipbook, never overlaps
 * the magazine. Icons are background-free SVGs; counts sit beside them.
 * "Save my page" is a single aligned pill on the left.
 */
export function PageReactionBar({
  issueSlug,
  issueTitle,
  issuePath,
  page,
}: PageReactionBarProps) {
  const [readerId, setReaderId] = useState("");
  const [ownReaction, setOwnReaction] = useState<ReactionKey | null>(null);
  const [counts, setCounts] = useState<PageReactionCounts>(
    EMPTY_REACTION_COUNTS,
  );
  const [pending, setPending] = useState<ReactionKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const ownReactionToken = useRef(0);

  useEffect(() => {
    setReaderId(getAnonymousReaderId());
    const existing = getPageBookmark(issueSlug);
    if (existing) setBookmarkedPage(existing.page);
  }, [issueSlug]);

  // Live counts for the current page (lightweight polling).
  useEffect(() => {
    setCounts(EMPTY_REACTION_COUNTS);
    return subscribePageReactionCounts({ issueSlug, page }, setCounts);
  }, [issueSlug, page]);

  // The reader's own reaction on this page.
  useEffect(() => {
    if (!readerId) return;
    const token = ++ownReactionToken.current;
    setOwnReaction(null);
    getOwnReaction({ readerId, issueSlug, page })
      .then((r) => {
        if (token === ownReactionToken.current) setOwnReaction(r);
      })
      .catch(() => {
        // non-fatal — the UI still lets them react
      });
  }, [readerId, issueSlug, page]);

  const isSaved = bookmarkedPage === page;

  function handleSavePage() {
    if (isSaved) {
      clearPageBookmark(issueSlug);
      setBookmarkedPage(null);
      return;
    }
    savePageBookmark({ issueSlug, issueTitle, issuePath, page });
    setBookmarkedPage(page);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1600);
  }

  async function handleReact(reaction: ReactionKey) {
    if (!readerId || pending) return;
    setError(null);
    setPending(reaction);
    const isToggleOff = ownReaction === reaction;
    const previous = ownReaction;

    // Each call claims a token. A later call bumps the token, so when an
    // earlier call's response (success or failure) lands, it can tell that
    // it's stale and refuse to overwrite the newer state.
    const token = ++ownReactionToken.current;

    // Optimistic update
    setOwnReaction(isToggleOff ? null : reaction);
    setCounts((prev) => {
      const next = { ...prev };
      if (previous) next[previous] = Math.max(0, next[previous] - 1);
      if (!isToggleOff) next[reaction] = next[reaction] + 1;
      return next;
    });

    try {
      const fresh = isToggleOff
        ? await clearPageReaction({ readerId, issueSlug, page })
        : await setPageReaction({ readerId, issueSlug, page, reaction });
      // Ignore the success payload if a newer click has already happened.
      if (token === ownReactionToken.current) setCounts(fresh);
    } catch {
      // Ignore the rollback too — the newer click's optimistic state is what
      // the user expects to see; rolling back to `previous` would erase it.
      if (token === ownReactionToken.current) {
        setOwnReaction(previous);
        setCounts((prev) => {
          const next = { ...prev };
          if (!isToggleOff) next[reaction] = Math.max(0, next[reaction] - 1);
          if (previous) next[previous] = next[previous] + 1;
          return next;
        });
        setError("Couldn't save — try again.");
      }
    } finally {
      if (token === ownReactionToken.current) setPending(null);
    }
  }

  return (
    <div
      role="region"
      aria-label="Page reactions"
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      {/* Save my page — single aligned pill */}
      <button
        type="button"
        onClick={handleSavePage}
        aria-pressed={isSaved}
        title={
          isSaved
            ? "Remove saved page"
            : "Save this page so you can come back later"
        }
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
          "transition-colors",
          isSaved
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        {isSaved ? (
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden="true" />
        )}
        <span>
          {justSaved ? "Saved!" : isSaved ? "Page saved" : "Save my page"}
        </span>
      </button>

      {/* Reactions — tap an emoji to react */}
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          React with
        </span>
        {REACTION_ICONS.map(({ key, label, emoji }) => {
          const active = ownReaction === key;
          const count = counts[key];
          const isPending = pending === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleReact(key)}
              disabled={!readerId || isPending}
              aria-pressed={active}
              aria-label={`${label}${count ? ` (${count})` : ""}`}
              title={label}
              className={cn(
                "group inline-flex items-center gap-1 rounded-full px-1.5 py-1",
                "transition-colors duration-200",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "bg-foreground/10"
                  : "hover:bg-foreground/5",
              )}
            >
              <span
                className={cn(
                  "text-lg leading-none transition-transform duration-200",
                  "group-active:scale-90",
                  active
                    ? "scale-110"
                    : "opacity-70 group-hover:scale-110 group-hover:opacity-100",
                )}
                aria-hidden="true"
              >
                {emoji}
              </span>
              {count > 0 ? (
                <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="w-full text-right text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
