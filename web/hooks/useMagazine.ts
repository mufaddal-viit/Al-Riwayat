"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Magazine, MagazineResponse } from "@/types/api";

export function useMagazine(id: string) {
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchMagazine() {
      try {
        setLoading(true);
        const { data } = await apiClient.get<MagazineResponse>(
          ENDPOINTS.magazine.byId(id),
        );
        setMagazine(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMagazine();
  }, [id]);

  const refetch = () => {
    /* refetch logic */
  };

  return { magazine, loading, error, refetch };
}
