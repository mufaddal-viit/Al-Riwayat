"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { searchDocs } from "@/lib/search/match";
import type { SearchDoc } from "@/lib/search/types";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_LABEL: Record<SearchDoc["type"], string> = {
  weekly: "Weekly Riwayat",
  issue: "Issues",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

/**
 * Site-wide search overlay.
 *
 * The whole published corpus is fetched once (small, cached) and filtered in
 * the browser, so results appear as you type with no request per keystroke.
 * Fully keyboard-driven: ↑/↓ to move, Enter to open, Esc to dismiss.
 */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch the index once, lazily, the first time search is opened.
  useEffect(() => {
    if (!open || docs !== null || loading) return;
    setLoading(true);
    fetch("/api/search-index", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((payload: { data?: SearchDoc[] }) => setDocs(payload.data ?? []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [open, docs, loading]);

  // Focus the field on open; reset state on close.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
    setQuery("");
    setActiveIndex(0);
  }, [open]);

  // Lock background scroll while the overlay is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const hits = useMemo(
    () => (docs ? searchDocs(docs, query) : []),
    [docs, query],
  );

  const recent = useMemo(
    () => (docs ?? []).slice(0, 6),
    [docs],
  );

  /** What's actually on screen: matches when searching, recent otherwise. */
  const visible = query.trim() ? hits.map((h) => h.doc) : recent;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const go = useCallback(
    (doc: SearchDoc) => {
      onClose();
      router.push(doc.href);
    },
    [onClose, router],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const doc = visible[activeIndex];
      if (doc) go(doc);
    }
  }

  // Keep the highlighted row in view while arrowing through results.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  // Group the visible docs by type, preserving rank order within each group.
  const groups = visible.reduce<Record<string, { doc: SearchDoc; index: number }[]>>(
    (acc, doc, index) => {
      (acc[doc.type] ??= []).push({ doc, index });
      return acc;
    },
    {},
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-md"
      />

      <div
        onKeyDown={onKeyDown}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-2xl"
      >
        {/* Field — borderless, the row itself is the affordance */}
        <div className="flex items-center gap-3 px-5">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
          <label htmlFor="site-search" className="sr-only">
            Search articles and issues
          </label>
          <input
            id="site-search"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles and issues…"
            autoComplete="off"
            spellCheck={false}
            className="w-full border-0 bg-transparent py-5 text-base text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-lg"
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[min(60vh,420px)] overflow-y-auto border-t border-border/40"
        >
          {visible.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {query.trim()
                  ? `Nothing matches “${query.trim()}”.`
                  : "Start typing to search."}
              </p>
              {query.trim() && (
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Try a title, a tag, or an issue number.
                </p>
              )}
            </div>
          ) : (
            <div className="py-2">
              {!query.trim() && (
                <p className="px-5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  Latest
                </p>
              )}
              {Object.entries(groups).map(([type, entries]) => (
                <div key={type}>
                  {query.trim() && (
                    <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                      {TYPE_LABEL[type as SearchDoc["type"]]}
                    </p>
                  )}
                  {entries.map(({ doc, index }) => {
                    const active = index === activeIndex;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => go(doc)}
                        className={cn(
                          "group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                          active ? "bg-muted/70" : "hover:bg-muted/40",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {doc.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {[doc.subtitle, formatDate(doc.date)]
                              .filter(Boolean)
                              .join(" · ") || doc.excerpt}
                          </span>
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all",
                            active
                              ? "translate-x-0 text-primary opacity-100"
                              : "-translate-x-1 opacity-0",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-border/40 px-5 py-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CornerDownLeft className="h-3 w-3" />
            to open
          </span>
          <span className="hidden sm:inline">↑ ↓ to navigate · Esc to close</span>
        </div>
      </div>
    </div>
  );
}
