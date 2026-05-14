"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  dismissBookmark,
  isBookmarkDismissed,
  listPageBookmarks,
  type PageBookmark,
} from "@/lib/page-bookmark";

// Small delay so the toast doesn't pop at the same instant as page paint —
// lets the layout settle and feels less abrupt.
const SHOW_DELAY_MS = 700;

export function BookmarkReturnToast() {
  const pathname = usePathname();
  const [bookmark, setBookmark] = useState<PageBookmark | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const candidates = listPageBookmarks();
    if (candidates.length === 0) return;

    const currentPageParam =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("page")
        : null;

    // Pick the most recent bookmark the user hasn't already dismissed this
    // session, and isn't already viewing.
    const target = candidates.find((b) => {
      if (isBookmarkDismissed(b.issueSlug)) return false;
      const alreadyThere =
        pathname === b.issuePath && Number(currentPageParam) === b.page;
      if (alreadyThere) return false;
      return true;
    });
    if (!target) return;

    setBookmark(target);
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function handleDismiss() {
    if (bookmark) dismissBookmark(bookmark.issueSlug);
    setVisible(false);
  }

  if (!bookmark) return null;

  const href = `${bookmark.issuePath}?page=${bookmark.page}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed right-3 top-3 z-50 sm:right-5 sm:top-5",
        "transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border/70",
          "bg-card/95 shadow-editorial backdrop-blur-xl",
        )}
      >
        <div className="h-1 w-full bg-gradient-to-r from-foreground/20 via-foreground/60 to-foreground/20" />
        <div className="space-y-3 px-4 py-3.5">
          <div className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 text-lg leading-none"
              role="presentation"
            >
              🔖
            </span>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                Pick up where you left off
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                You bookmarked page {bookmark.page} of{" "}
                <span className="text-foreground">{bookmark.issueTitle}</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={href}
              onClick={handleDismiss}
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background",
                "transition-opacity hover:opacity-90",
              )}
            >
              Jump to page {bookmark.page}
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                "inline-flex items-center justify-center rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground",
                "transition-colors hover:bg-background hover:text-foreground",
              )}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
