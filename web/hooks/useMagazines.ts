"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Magazine, MagazineListResponse } from "@/types/api";
import { normalizeError } from "@/lib/api/error";

export function usePublishedMagazines() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMagazines() {
      try {
        setLoading(true);
        const { data } = await apiClient.get<MagazineListResponse>(
          ENDPOINTS.magazine.featured,
        );
        setMagazines(data.data);
      } catch (err) {
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
