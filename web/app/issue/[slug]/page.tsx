import type { Metadata } from "next";

import type { Magazine, ApiResponse, PaginatedResponse } from "@/types/api";
import { AppError } from "@/lib/api/error";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { buildMetadata } from "@/lib/metadata";
import { publicEnv } from "@/lib/public-env";
import { getIssueBySlug, listIssueSlugs } from "@/lib/content/issues";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { ArticleStructuredData } from "@/components/issue/article-structured-data";
import { IssueComingSoon } from "@/components/issue/issue-coming-soon";
import { IssueRichContent } from "@/components/issue/issue-rich-content";
import { IssueShareActions } from "@/components/issue/issue-share-actions";

import { IssuePageClient } from "./IssuePageClient";

const API_URL = publicEnv.apiUrl;

async function serverFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok)
    throw new AppError({ message: res.statusText, status: res.status });
  return res.json();
}

export async function generateStaticParams() {
  const localSlugs = listIssueSlugs();
  try {
    const { data: issues } = await serverFetch<PaginatedResponse<Magazine>>(
      ENDPOINTS.magazine.list,
    );
    const apiSlugs = issues.map((issue) => issue.slug);
    const all = new Set([...localSlugs, ...apiSlugs]);
    return Array.from(all).map((slug) => ({ slug }));
  } catch {
    return localSlugs.map((slug) => ({ slug }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const local = getIssueBySlug(params.slug);
  if (local) {
    return buildMetadata({
      title: local.comingSoon ? `${local.title} — Coming Soon` : local.title,
      description: local.summary,
      path: `/issue/${local.slug}`,
      image: local.coverImageUrl,
      type: "article",
      publishedTime: local.publishedAt,
      authors: [local.author],
    });
  }

  try {
    const { data: magazine } = await serverFetch<ApiResponse<Magazine>>(
      ENDPOINTS.magazine.byId(params.slug),
    );
    return buildMetadata({
      title: magazine.title,
      description: magazine.summary,
      path: `/issue/${params.slug}`,
      image: magazine.coverImageUrl,
      type: "article",
    });
  } catch {
    return buildMetadata({
      title: "Issue",
      description: "Al-Riwayat Magazine issue.",
      path: `/issue/${params.slug}`,
    });
  }
}

export default function IssuePage({ params }: { params: { slug: string } }) {
  const local = getIssueBySlug(params.slug);

  if (local) {
    if (local.comingSoon) {
      return <IssueComingSoon issue={local} />;
    }

    return (
      <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10 lg:py-14">
        <ArticleStructuredData issue={local} />
        <IssueRichContent issue={local} />
        <IssueShareActions issue={local} />
        <NewsletterPreviewSection />
      </div>
    );
  }

  return <IssuePageClient slug={params.slug} />;
}
