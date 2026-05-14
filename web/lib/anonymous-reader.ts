/**
 * Stable per-device anonymous id used to attribute lightweight engagement
 * actions (like page reactions) without a login system. One id per browser
 * — kept in localStorage; falls back to an in-memory id if storage is
 * unavailable so the current session still works.
 */

const STORAGE_KEY = "al_riwayat_anon_reader_id";

let memoryFallback: string | null = null;

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnonymousReaderId(): string {
  if (typeof window === "undefined") {
    // SSR — return a placeholder; the real id is read on the client
    return "";
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = generateId();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    if (!memoryFallback) memoryFallback = generateId();
    return memoryFallback;
  }
}
