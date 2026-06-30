import type { Metadata } from "next";

import type { WeeklyResponse } from "@/types/api";
import { AppError } from "@/lib/api/error";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { buildMetadata } from "@/lib/metadata";
import { publicEnv } from "@/lib/public-env";

import { WeeklyArticleClient } from "./WeeklyArticleClient";

const API_URL = publicEnv.apiUrl;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}${ENDPOINTS.weekly.byId(params.slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok)
      throw new AppError({ message: res.statusText, status: res.status });
    const { data } = (await res.json()) as WeeklyResponse;
    return buildMetadata({
      title: data.title,
      description: data.excerpt,
      path: `/weekly-riwayat/${data.slug}`,
      type: "article",
      publishedTime: data.publishedAt ?? undefined,
      authors: [data.author],
    });
  } catch {
    return buildMetadata({
      title: "Weekly Riwayat",
      description: "A short weekly read from Al-Riwayat.",
      path: `/weekly-riwayat/${params.slug}`,
      type: "article",
    });
  }
}

export default function WeeklyArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  return <WeeklyArticleClient slug={params.slug} />;
}
