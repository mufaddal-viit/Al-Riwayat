import { findAdById } from "./ads.repo.firestore";
import * as statsRepo from "./ads.stats.repo.firestore";
import type { DailyStat } from "./ads.stats.repo.firestore";
import type { AdEvent } from "./ads.stats.schema";

// ─── Recording ────────────────────────────────────────────────────────────────

export function recordEvents(events: AdEvent[], visitorHash?: string) {
  return statsRepo.recordEvents(events, visitorHash);
}

// ─── Admin summary ────────────────────────────────────────────────────────────

export interface AdStatsSummary {
  adId: string;
  from: string;
  to: string;
  totals: {
    impressions: number;
    clicks: number;
    ctr: number; // 0..1, computed on read — never stored
    impressionsMobile: number;
    impressionsDesktop: number;
    clicksMobile: number;
    clicksDesktop: number;
    /** Distinct visitor devices that saw the ad in this range. */
    uniqueDevices: number;
  };
  /** Lifetime running totals from the ad doc (all-time, not range-bound). */
  lifetime: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
  caps: {
    maxImpressions: number | null;
    maxClicks: number | null;
    impressionsPct: number | null; // lifetime impressions / cap
    clicksPct: number | null;
  };
  /** One row per day in [from, to], gaps filled with zeros for charting. */
  daily: DailyStat[];
}

function ctr(clicks: number, impressions: number): number {
  return impressions > 0 ? clicks / impressions : 0;
}

/** Every yyyy-mm-dd from `from` to `to` inclusive (UTC). */
function dateRange(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  // Guard against an inverted or absurd range.
  let guard = 0;
  while (cursor <= end && guard < 400) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return days;
}

const emptyDay = (date: string): DailyStat => ({
  date,
  impressions: 0,
  clicks: 0,
  impressionsMobile: 0,
  impressionsDesktop: 0,
  clicksMobile: 0,
  clicksDesktop: 0,
  uniqueDevices: 0,
});

export async function getAdStats(
  adId: string,
  from: string,
  to: string,
): Promise<AdStatsSummary | null> {
  const ad = await findAdById(adId);
  if (!ad) return null;

  const rows = await statsRepo.readDailyStats(adId, from, to);
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const daily = dateRange(from, to).map((d) => byDate.get(d) ?? emptyDay(d));

  const totals = daily.reduce(
    (acc, day) => {
      acc.impressions += day.impressions;
      acc.clicks += day.clicks;
      acc.impressionsMobile += day.impressionsMobile;
      acc.impressionsDesktop += day.impressionsDesktop;
      acc.clicksMobile += day.clicksMobile;
      acc.clicksDesktop += day.clicksDesktop;
      // Uniques are per-day distinct; summing across days approximates the
      // range total (a device active on 2 days counts twice). Good enough for
      // reporting without storing a range-wide fingerprint set.
      acc.uniqueDevices += day.uniqueDevices;
      return acc;
    },
    {
      impressions: 0,
      clicks: 0,
      impressionsMobile: 0,
      impressionsDesktop: 0,
      clicksMobile: 0,
      clicksDesktop: 0,
      uniqueDevices: 0,
    },
  );

  const maxImpressions = ad.maxImpressions;
  const maxClicks = ad.maxClicks;

  return {
    adId,
    from,
    to,
    totals: { ...totals, ctr: ctr(totals.clicks, totals.impressions) },
    lifetime: {
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: ctr(ad.clicks, ad.impressions),
    },
    caps: {
      maxImpressions,
      maxClicks,
      impressionsPct:
        maxImpressions && maxImpressions > 0
          ? Math.min(1, ad.impressions / maxImpressions)
          : null,
      clicksPct:
        maxClicks && maxClicks > 0 ? Math.min(1, ad.clicks / maxClicks) : null,
    },
    daily,
  };
}
