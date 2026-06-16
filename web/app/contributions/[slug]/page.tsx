import type { Metadata } from "next";

import type { ContributionResponse } from "@/types/api";
import { AppError } from "@/lib/api/error";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { buildMetadata } from "@/lib/metadata";
import { publicEnv } from "@/lib/public-env";
import { placeholderContributions } from "@/lib/content/contributions";

import { ContributionPageClient } from "./ContributionPageClient";

const API_URL = publicEnv.apiUrl;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Prefer the API; fall back to local placeholder content.
  try {
    const res = await fetch(
      `${API_URL}${ENDPOINTS.contributions.byId(params.slug)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok)
      throw new AppError({ message: res.statusText, status: res.status });
    const { data } = (await res.json()) as ContributionResponse;
    return buildMetadata({
      title: data.title,
      description: data.excerpt,
      path: `/contributions/${data.slug}`,
      image: data.coverImageUrl,
      type: "article",
      publishedTime: data.publishedAt,
      authors: [data.author],
    });
  } catch {
    const local = placeholderContributions.find(
      (c) => c.slug === params.slug,
    );
    return buildMetadata({
      title: local?.title ?? "Contribution",
      description:
        local?.excerpt ?? "A story shared by the Al-Riwayat community.",
      path: `/contributions/${params.slug}`,
      image: local?.coverImageUrl,
      type: "article",
    });
  }
}

export default function ContributionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ContributionPageClient slug={params.slug} />;
}
