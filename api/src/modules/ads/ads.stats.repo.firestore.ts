import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type { AdEvent } from "./ads.stats.schema";
import type { TargetDevice } from "./ads.types";

const COLLECTION = "ads";
const STATS_SUBCOLLECTION = "dailyStats";

/** UTC day key, e.g. "2026-07-18". Stats are bucketed by UTC day. */
function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

interface StoredDailyStat {
  date: string;
  impressions?: number;
  clicks?: number;
  impressionsMobile?: number;
  impressionsDesktop?: number;
  clicksMobile?: number;
  clicksDesktop?: number;
}

export interface DailyStat {
  date: string;
  impressions: number;
  clicks: number;
  impressionsMobile: number;
  impressionsDesktop: number;
  clicksMobile: number;
  clicksDesktop: number;
}

function toDailyStat(data: StoredDailyStat): DailyStat {
  return {
    date: data.date,
    impressions: data.impressions ?? 0,
    clicks: data.clicks ?? 0,
    impressionsMobile: data.impressionsMobile ?? 0,
    impressionsDesktop: data.impressionsDesktop ?? 0,
    clicksMobile: data.clicksMobile ?? 0,
    clicksDesktop: data.clicksDesktop ?? 0,
  };
}

/**
 * Apply a batch of events. Each event increments the ad's running totals (used
 * for caps + list display) and its per-day stat doc (used for charts). Uses
 * atomic FieldValue.increment so concurrent writes never clobber each other,
 * and a merge set so the day doc is created on first write. Unknown ad ids are
 * skipped silently — this is a public endpoint and must not error on bad input.
 */
export async function recordEvents(events: AdEvent[]): Promise<void> {
  const db = getAdminDb();
  const today = dayKey();

  // Coalesce by ad so we issue one batch efficiently.
  await Promise.all(
    events.map(async (event) => {
      const adRef = db.collection(COLLECTION).doc(event.adId);
      const exists = (await adRef.get()).exists;
      if (!exists) return;

      const dayRef = adRef.collection(STATS_SUBCOLLECTION).doc(today);
      const field = event.type === "impression" ? "impressions" : "clicks";
      const deviceField = deviceCounterField(event.type, event.device);

      const totalsPatch: Record<string, unknown> = {
        [field]: FieldValue.increment(1),
      };
      const dayPatch: Record<string, unknown> = {
        date: today,
        [field]: FieldValue.increment(1),
      };
      if (deviceField) dayPatch[deviceField] = FieldValue.increment(1);

      await Promise.all([
        adRef.update(totalsPatch),
        dayRef.set(dayPatch, { merge: true }),
      ]);
    }),
  );
}

function deviceCounterField(
  type: "impression" | "click",
  device?: TargetDevice,
): string | null {
  if (!device) return null;
  if (type === "impression") {
    return device === "mobile" ? "impressionsMobile" : "impressionsDesktop";
  }
  return device === "mobile" ? "clicksMobile" : "clicksDesktop";
}

/** Read daily stats for an ad within an inclusive yyyy-mm-dd range. */
export async function readDailyStats(
  adId: string,
  from: string,
  to: string,
): Promise<DailyStat[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .doc(adId)
    .collection(STATS_SUBCOLLECTION)
    .where("date", ">=", from)
    .where("date", "<=", to)
    .orderBy("date", "asc")
    .get();

  return snap.docs.map((d) => toDailyStat(d.data() as StoredDailyStat));
}
