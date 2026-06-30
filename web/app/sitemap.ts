import type { MetadataRoute } from "next";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";
import { publicEnv } from "@/lib/public-env";
import { siteConfig } from "@/lib/site";
import { listIssueSlugs } from "@/lib/content/issues";
import type {
  Magazine,
  PaginatedResponse,
  WeeklyListResponse,
} from "@/types/api";

export const revalidate = 3600;

async function fetchIssueSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${publicEnv.apiUrl}${ENDPOINTS.magazine.list}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new AppError({ message: res.statusText, status: res.status });
    const payload = (await res.json()) as PaginatedResponse<Magazine>;
    return payload.data.map((issue) => issue.slug);
  } catch {
    return [];
  }
}

async function fetchWeeklySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${publicEnv.apiUrl}${ENDPOINTS.weekly.list}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new AppError({ message: res.statusText, status: res.status });
    const payload = (await res.json()) as WeeklyListResponse;
    return (payload.data ?? []).map((article) => article.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: new URL("/", siteConfig.url).toString(), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/about", siteConfig.url).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: new URL("/weekly-riwayat", siteConfig.url).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/contributions", siteConfig.url).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: new URL("/contribute", siteConfig.url).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.6 }
  ];

  const apiSlugs = await fetchIssueSlugs();
  const issueSlugs = Array.from(new Set([...listIssueSlugs(), ...apiSlugs]));
  const issueRoutes: MetadataRoute.Sitemap = issueSlugs.map((slug) => ({
    url: new URL(`/issue/${slug}`, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const weeklySlugs = await fetchWeeklySlugs();
  const weeklyRoutes: MetadataRoute.Sitemap = weeklySlugs.map((slug) => ({
    url: new URL(`/weekly-riwayat/${slug}`, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [...staticRoutes, ...issueRoutes, ...weeklyRoutes];
}
