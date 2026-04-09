"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { MagazineSearchResponse } from "@/types/api";

export function useMagazineSearch(query: string) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    async function search() {
      setLoading(true);
      const url = ENDPOINTS.magazine.search(query);
      const { data } = await apiClient.get(url);
      setResults(data.data);
      setLoading(false);
    }

    search();
  }, [query]);

  return { results, loading, error };
}
