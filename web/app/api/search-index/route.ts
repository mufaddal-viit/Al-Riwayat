import { ENDPOINTS } from "@/lib/api/endpoints";
import { publicEnv } from "@/lib/public-env";
import type {
  Magazine,
  PaginatedResponse,
  WeeklyListResponse,
} from "@/types/api";
import type { SearchDoc } from "@/lib/search/types";

// Rebuilt at most once an hour — the corpus changes rarely.
export const revalidate = 3600;

async function fetchIssues(): Promise<SearchDoc[]> {
  try {
    const res = await fetch(`${publicEnv.apiUrl}${ENDPOINTS.magazine.list}`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as PaginatedResponse<Magazine>;
    return (payload.data ?? []).map((issue) => ({
      id: `issue-${issue.slug}`,
      type: "issue" as const,
      title: issue.title,
      subtitle: `Issue ${issue.issueNumber}`,
      excerpt: issue.summary ?? "",
      tags: [],
      href: `/issue/${issue.slug}`,
      date: issue.publishedAt ?? null,
    }));
  } catch {
    return [];
  }
}

async function fetchWeekly(): Promise<SearchDoc[]> {
  try {
    const res = await fetch(`${publicEnv.apiUrl}${ENDPOINTS.weekly.list}`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as WeeklyListResponse;
    return (payload.data ?? []).map((article) => ({
      id: `weekly-${article.slug}`,
      type: "weekly" as const,
      title: article.title,
      subtitle: article.subtitle ?? "",
      excerpt: article.excerpt ?? "",
      tags: article.tags ?? [],
      href: `/weekly-riwayat/${article.slug}`,
      date: article.weekOf ?? article.publishedAt ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * GET /api/search-index — a slim, cached index of all published content.
 *
 * The corpus is small (dozens of items), so the client downloads it once and
 * filters in memory. That gives instant, typo-tolerant substring search which
 * Firestore itself cannot do, with no search infrastructure to run.
 */
export async function GET() {
  const [issues, weekly] = await Promise.all([fetchIssues(), fetchWeekly()]);
  const docs = [...weekly, ...issues].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );

  return Response.json(
    { success: true, data: docs },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
