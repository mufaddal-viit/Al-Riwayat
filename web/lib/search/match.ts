import type { SearchDoc } from "./types";

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

/** Lowercase, strip accents and punctuation so matching is forgiving. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when every character of `query` appears in `text` in order (not
 * necessarily adjacent) — cheap typo tolerance for things like "wkly" → weekly.
 */
function isSubsequence(query: string, text: string): boolean {
  let qi = 0;
  for (let ti = 0; ti < text.length && qi < query.length; ti += 1) {
    if (text[ti] === query[qi]) qi += 1;
  }
  return qi === query.length;
}

/**
 * Score one field. Exact/prefix/word-boundary hits rank far above a loose
 * subsequence match, so the best titles surface first.
 */
function scoreField(query: string, field: string, weight: number): number {
  if (!field) return 0;
  const text = normalize(field);
  if (!text) return 0;

  if (text === query) return weight * 10;
  if (text.startsWith(query)) return weight * 6;
  // Word-boundary match, e.g. "riw" in "weekly riwayat".
  if (new RegExp(`\\b${escapeRegex(query)}`).test(text)) return weight * 4;
  if (text.includes(query)) return weight * 2;
  if (query.length >= 3 && isSubsequence(query, text)) return weight * 0.5;
  return 0;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Rank documents against a query. Every whitespace-separated term must match
 * something (AND semantics), and per-field weights favour titles over body
 * text. Returns hits ordered best-first, then by recency.
 */
export function searchDocs(
  docs: SearchDoc[],
  rawQuery: string,
  limit = 12,
): SearchHit[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const terms = query.split(" ").filter(Boolean);

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    let total = 0;
    let everyTermMatched = true;

    for (const term of terms) {
      const termScore =
        scoreField(term, doc.title, 5) +
        scoreField(term, doc.subtitle, 3) +
        scoreField(term, doc.tags.join(" "), 3) +
        scoreField(term, doc.excerpt, 1);

      if (termScore === 0) {
        everyTermMatched = false;
        break;
      }
      total += termScore;
    }

    if (everyTermMatched && total > 0) hits.push({ doc, score: total });
  }

  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.doc.date ?? "").localeCompare(a.doc.date ?? ""),
    )
    .slice(0, limit);
}
