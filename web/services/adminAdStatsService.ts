export interface DailyStat {
  date: string;
  impressions: number;
  clicks: number;
  impressionsMobile: number;
  impressionsDesktop: number;
  clicksMobile: number;
  clicksDesktop: number;
  uniqueDevices: number;
}

export interface AdStatsSummary {
  adId: string;
  from: string;
  to: string;
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    impressionsMobile: number;
    impressionsDesktop: number;
    clicksMobile: number;
    clicksDesktop: number;
    uniqueDevices: number;
  };
  lifetime: { impressions: number; clicks: number; ctr: number };
  caps: {
    maxImpressions: number | null;
    maxClicks: number | null;
    impressionsPct: number | null;
    clicksPct: number | null;
  };
  daily: DailyStat[];
}

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };
  if (!response.ok) throw new Error(payload.message ?? "Request failed.");
  return payload.data as T;
}

export async function getAdStats(
  id: string,
  range?: { from?: string; to?: string },
): Promise<AdStatsSummary> {
  const params = new URLSearchParams();
  if (range?.from) params.set("from", range.from);
  if (range?.to) params.set("to", range.to);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/admin/ads/${id}/stats${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdStatsSummary>(response);
}
