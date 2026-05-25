"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Magazine, MagazineListResponse } from "@/types/api";
import { normalizeError } from "@/lib/api/error";
import { listIssues, type IssueContent } from "@/lib/content/issues";

function issueToMagazine(issue: IssueContent): Magazine {
  return {
    id: issue.slug,
    title: issue.title,
    issueNumber: issue.issueNumber,
    slug: issue.slug,
    publishedAt: issue.publishedAt,
    summary: issue.summary,
    coverImageUrl: issue.coverImageUrl,
    coverImageAlt: issue.coverImageAlt,
    flipbookUrl: issue.flipbookUrl,
    author: issue.author,
    status: issue.comingSoon ? "draft" : "published",
    createdAt: issue.publishedAt,
    updatedAt: issue.publishedAt,
  };
}

const localPublishedMagazines = listIssues()
  .filter((issue) => !issue.comingSoon)
  .map(issueToMagazine);

export function usePublishedMagazines() {
  const [magazines, setMagazines] = useState<Magazine[]>(localPublishedMagazines);
  const [loading, setLoading] = useState(apiConfig.enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiConfig.enabled) {
      setMagazines(localPublishedMagazines);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchMagazines() {
      try {
        setLoading(true);
        const { data } = await apiClient.get<MagazineListResponse>(
          ENDPOINTS.magazine.featured,
        );
        setMagazines(data.data);
      } catch (err) {
        setMagazines(localPublishedMagazines);
        setError(normalizeError(err as any).message);
      } finally {
        setLoading(false);
      }
    }

    fetchMagazines();
  }, []);

  return {
    magazines,
    loading,
    error,
    refetch: () => {
      /* trigger refetch */
    },
  };
}
