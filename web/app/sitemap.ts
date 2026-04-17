import type { MetadataRoute } from "next";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";
import { publicEnv } from "@/lib/public-env";
import { siteConfig } from "@/lib/site";
import type { Magazine, PaginatedResponse } from "@/types/api";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: new URL("/", siteConfig.url).toString(), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/about", siteConfig.url).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: new URL("/mission", siteConfig.url).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: new URL("/issue-1", siteConfig.url).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.6 }
  ];

  const issueSlugs = await fetchIssueSlugs();
  const issueRoutes: MetadataRoute.Sitemap = issueSlugs.map((slug) => ({
    url: new URL(`/issue/${slug}`, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...issueRoutes];
}
