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
  /** Count of distinct visitor fingerprints seen this day. */
  uniqueDevices?: number;
  /**
   * Set of anonymized fingerprint hashes seen this day, keyed hash -> true.
   * Used only to de-duplicate uniques; capped to avoid unbounded growth.
   * Never contains a raw IP.
   */
  seen?: Record<string, boolean>;
}

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

/** Cap on stored per-day fingerprints, to bound document size. */
const MAX_SEEN_PER_DAY = 5000;

function toDailyStat(data: StoredDailyStat): DailyStat {
  return {
    date: data.date,
    impressions: data.impressions ?? 0,
    clicks: data.clicks ?? 0,
    impressionsMobile: data.impressionsMobile ?? 0,
    impressionsDesktop: data.impressionsDesktop ?? 0,
    clicksMobile: data.clicksMobile ?? 0,
    clicksDesktop: data.clicksDesktop ?? 0,
    uniqueDevices: data.uniqueDevices ?? 0,
  };
}

/**
 * Apply a batch of events. Each event increments the ad's running totals (used
 * for caps + list display) and its per-day stat doc (used for charts). Uses
 * atomic FieldValue.increment so concurrent writes never clobber each other.
 *
 * `visitorHash` is an anonymized fingerprint (hash of IP + user-agent — never a
 * raw IP). The first time a fingerprint is seen for an ad on a given day, that
 * day's `uniqueDevices` is incremented and the hash is remembered so repeat
 * events from the same device don't inflate the unique count.
 *
 * Unknown ad ids are skipped silently — this is a public endpoint and must not
 * error on bad input.
 */
export async function recordEvents(
  events: AdEvent[],
  visitorHash?: string,
): Promise<void> {
  const db = getAdminDb();
  const today = dayKey();

  await Promise.all(
    events.map(async (event) => {
      const adRef = db.collection(COLLECTION).doc(event.adId);
      const exists = (await adRef.get()).exists;
      if (!exists) return;

      const dayRef = adRef.collection(STATS_SUBCOLLECTION).doc(today);
      const field = event.type === "impression" ? "impressions" : "clicks";
      const deviceField = deviceCounterField(event.type, event.device);

      await adRef.update({ [field]: FieldValue.increment(1) });

      // Count uniques transactionally so concurrent first-sights of the same
      // fingerprint don't double-count.
      await db.runTransaction(async (tx) => {
        const daySnap = await tx.get(dayRef);
        const data = (daySnap.data() as StoredDailyStat | undefined) ?? {
          date: today,
        };

        const patch: Record<string, unknown> = {
          date: today,
          [field]: FieldValue.increment(1),
        };
        if (deviceField) patch[deviceField] = FieldValue.increment(1);

        if (visitorHash) {
          const seen = data.seen ?? {};
          const isNew = !seen[visitorHash];
          const underCap = Object.keys(seen).length < MAX_SEEN_PER_DAY;
          if (isNew && underCap) {
            patch[`seen.${visitorHash}`] = true;
            patch.uniqueDevices = FieldValue.increment(1);
          }
        }

        tx.set(dayRef, patch, { merge: true });
      });
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
