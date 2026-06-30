"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError } from "@/lib/api/error";
import type {
  WeeklyArticle,
  WeeklyListResponse,
  WeeklyResponse,
} from "@/types/api";

/** Loads the published Weekly Riwayat articles (newest first). */
export function useWeeklyArticles() {
  const [articles, setArticles] = useState<WeeklyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<WeeklyListResponse>(ENDPOINTS.weekly.list)
      .then(({ data }) => {
        if (!cancelled) setArticles(data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load Weekly Riwayat right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, loading, error };
}

type ArticleStatus = "loading" | "found" | "not_found" | "error";

/** Loads a single published Weekly Riwayat article by slug. */
export function useWeeklyArticle(slug: string) {
  const [article, setArticle] = useState<WeeklyArticle | null>(null);
  const [status, setStatus] = useState<ArticleStatus>("loading");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    apiClient
      .get<WeeklyResponse>(ENDPOINTS.weekly.byId(slug))
      .then(({ data }) => {
        if (cancelled) return;
        setArticle(data.data);
        setStatus("found");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AppError && err.status === 404) {
          setStatus("not_found");
        } else {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, status };
}
