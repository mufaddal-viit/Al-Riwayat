"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AppError, normalizeError } from "@/lib/api/error";
import {
  placeholderContributions,
  sortContributions,
} from "@/lib/content/contributions";
import type {
  Contribution,
  ContributionListResponse,
  ContributionResponse,
} from "@/types/api";

/**
 * Loads the published contributions list. Falls back to local placeholder
 * content when the API is unreachable so the page is usable before the
 * backend `/contributions` endpoint exists.
 */
export function useContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<ContributionListResponse>(ENDPOINTS.contributions.list)
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.data ?? [];
        if (list.length === 0) {
          setContributions(sortContributions(placeholderContributions));
          setUsingFallback(true);
        } else {
          setContributions(sortContributions(list));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setContributions(sortContributions(placeholderContributions));
        setUsingFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { contributions, loading, usingFallback };
}

type ContributionStatus = "loading" | "found" | "not_found" | "error";

/**
 * Loads a single contribution by slug, with the same placeholder fallback as
 * the list hook (so individual links resolve in local dev).
 */
export function useContribution(slug: string) {
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [status, setStatus] = useState<ContributionStatus>("loading");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    apiClient
      .get<ContributionResponse>(ENDPOINTS.contributions.byId(slug))
      .then(({ data }) => {
        if (cancelled) return;
        setContribution(data.data);
        setStatus("found");
      })
      .catch((err) => {
        if (cancelled) return;
        const fallback = placeholderContributions.find((c) => c.slug === slug);
        if (fallback) {
          setContribution(fallback);
          setStatus("found");
          return;
        }
        if (err instanceof AppError && err.status === 404) {
          setStatus("not_found");
        } else {
          // Surface network errors via normalizeError for consistency, but the
          // page only needs the coarse status.
          normalizeError(err);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { contribution, status };
}
