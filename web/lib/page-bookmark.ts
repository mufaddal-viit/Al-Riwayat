/**
 * Per-device "last bookmarked page" for an issue. Anonymous — no account
 * needed. Used by the issue reactions bar to save the user's place and by
 * the global return-visit toast to offer a CTA back to that page.
 *
 * One bookmark per issue slug. Saving overwrites the previous one.
 */

const STORAGE_KEY = "al_riwayat_page_bookmarks";
const DISMISSED_KEY = "al_riwayat_page_bookmarks_dismissed";

export interface PageBookmark {
  issueSlug: string;
  issueTitle: string;
  page: number;
  /** Path on this site that renders the issue (e.g. "/issue-1"). */
  issuePath: string;
  savedAt: number;
}

type BookmarkMap = Record<string, PageBookmark>;

function readMap(): BookmarkMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as BookmarkMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: BookmarkMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage disabled — silently ignore
  }
}

function readDismissed(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, number>)
      : {};
  } catch {
    return {};
  }
}

function writeDismissed(map: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function savePageBookmark(input: Omit<PageBookmark, "savedAt">): void {
  const map = readMap();
  map[input.issueSlug] = { ...input, savedAt: Date.now() };
  writeMap(map);
}

export function getPageBookmark(issueSlug: string): PageBookmark | null {
  return readMap()[issueSlug] ?? null;
}

/** All bookmarks, newest first. */
export function listPageBookmarks(): PageBookmark[] {
  return Object.values(readMap()).sort((a, b) => b.savedAt - a.savedAt);
}

export function clearPageBookmark(issueSlug: string): void {
  const map = readMap();
  if (!(issueSlug in map)) return;
  delete map[issueSlug];
  writeMap(map);
}

/**
 * The toast is dismissed per-tab-session, not forever — so they get nudged
 * again next time they open the site, but not nagged inside one session.
 */
export function isBookmarkDismissed(issueSlug: string): boolean {
  return Boolean(readDismissed()[issueSlug]);
}

export function dismissBookmark(issueSlug: string): void {
  const map = readDismissed();
  map[issueSlug] = Date.now();
  writeDismissed(map);
}
