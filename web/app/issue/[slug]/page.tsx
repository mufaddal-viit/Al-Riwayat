import type { Metadata } from "next";
import type { Magazine } from "@/types/api";

import { notFound } from "next/navigation";

import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { ArticleStructuredData } from "@/components/issue/article-structured-data";
import { IssueRichContent } from "@/components/issue/issue-rich-content";
import { IssueShareActions } from "@/components/issue/issue-share-actions";
import { buildMetadata } from "@/lib/metadata";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { AppError } from "@/lib/api/error";

// ─── Server-side helper ───────────────────────────────────────────────────────

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function serverFetch<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, init);
  if (!res.ok)
    throw new AppError({ message: res.statusText, status: res.status });
  return res.json();
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
      { next: { revalidate: 3600 } },
    );

    return buildMetadata({
      title: magazine.title,
      description: magazine.summary,
      path: `/issues/${params.slug}`, // ← canonical URL path
      image: magazine.coverImageUrl,
    });
  } catch {
    return buildMetadata({
      title: "Issue Not Found",
      description: "This issue could not be found.",
      path: `/issues/${params.slug}`,
    });
  }
}

// ─── Static Params ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const { data: issues } = await serverFetch<PaginatedResponse<Magazine>>(
      ENDPOINTS.magazine.list,
      { next: { revalidate: 3600 } },
    );
    return issues.map((issue) => ({ slug: issue.slug }));
  } catch {
    return [];
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function IssuePage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const { data: response } = await apiClient.get<ApiResponse<Magazine>>(
      ENDPOINTS.magazine.byId(params.slug),
    );
    const magazine = response.data;

    return (
      <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10 lg:py-14">
        <ArticleStructuredData magazine={magazine} />
        <IssueShareActions />
        <IssueRichContent magazine={magazine} />
        <NewsletterPreviewSection />
      </div>
    );
  } catch (err) {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  }
}
