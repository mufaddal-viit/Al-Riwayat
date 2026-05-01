/**
 * Lightweight client-side memory of who the reader is.
 *
 * Captured the first time they fill the engagement modal, then reused
 * to prefill name/email in the comments and contact forms — there is
 * no login system, so this is the only identity we have.
 */

const STORAGE_KEY = "al_riwayat_reader_identity";

export interface ReaderIdentity {
  name: string;
  email: string;
}

export function getReaderIdentity(): ReaderIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReaderIdentity>;
    if (!parsed.name || !parsed.email) return null;
    return { name: parsed.name, email: parsed.email };
  } catch {
    return null;
  }
}

export function setReaderIdentity(identity: ReaderIdentity): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // localStorage may be disabled — silently ignore
  }
}
