import type { Magazine, ApiResponse, PaginatedResponse } from "@/types/api";
import { AppError } from "@/lib/api/error";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { buildMetadata } from "@/lib/metadata";
import { publicEnv } from "@/lib/public-env";
import { IssuePageClient } from "./IssuePageClient";
import type { Metadata } from "next";

// ─── Server-side helper ───────────────────────────────────────────────────────

const API_URL = publicEnv.apiUrl;

async function serverFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok)
    throw new AppError({ message: res.statusText, status: res.status });
  return res.json();
}

// ─── Static params (required for output: "export") ───────────────────────────

export async function generateStaticParams() {
  try {
    const { data: issues } = await serverFetch<PaginatedResponse<Magazine>>(
      ENDPOINTS.magazine.list,
    );
    return issues.map((issue) => ({ slug: issue.slug }));
  } catch {
    // API not reachable at build time — no pages pre-rendered.
    // The client component will fetch data at runtime instead.
    return [];
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { data: magazine } = await serverFetch<ApiResponse<Magazine>>(
      ENDPOINTS.magazine.byId(params.slug),
    );
    return buildMetadata({
      title: magazine.title,
      description: magazine.summary,
      path: `/issue/${params.slug}`,
      image: magazine.coverImageUrl,
    });
  } catch {
    return buildMetadata({
      title: "Issue",
      description: "Al-Riwayat Magazine issue.",
      path: `/issue/${params.slug}`,
    });
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IssuePage({ params }: { params: { slug: string } }) {
  return <IssuePageClient slug={params.slug} />;
}
