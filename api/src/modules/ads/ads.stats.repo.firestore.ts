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
 * raw IP). A device is counted in `uniqueDevices` the FIRST time it SEES the ad
 * on a given day: only impressions count towards reach, and the hash is then
 * remembered so further impressions (or any clicks) from that device that day
 * do not inflate the number.
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
        const data = daySnap.data() as StoredDailyStat | undefined;

        const patch: Record<string, unknown> = {
          date: today,
          [field]: FieldValue.increment(1),
        };
        if (deviceField) patch[deviceField] = FieldValue.increment(1);

        // Reach is measured by views, so only an impression can register a new
        // unique device — repeat clicks must never move this number.
        if (visitorHash && event.type === "impression") {
          const seen = data?.seen ?? {};
          const isNew = !seen[visitorHash];
          const underCap = Object.keys(seen).length < MAX_SEEN_PER_DAY;
          if (isNew && underCap) {
            // Nested object (not a "seen.<hash>" dotted key) so merge writes it
            // into the map — a dotted key would create a literal field name and
            // the next read would never find it, counting the device again.
            patch.seen = { [visitorHash]: true };
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

/**
 * Wipe all recorded stats for an ad: every daily doc plus the running totals.
 * Used to clear test data so a campaign can start from a clean baseline.
 */
export async function resetStats(adId: string): Promise<void> {
  const db = getAdminDb();
  const adRef = db.collection(COLLECTION).doc(adId);

  const days = await adRef.collection(STATS_SUBCOLLECTION).get();
  // Batch deletes in chunks well under Firestore's 500-op limit.
  const chunkSize = 400;
  for (let i = 0; i < days.docs.length; i += chunkSize) {
    const batch = db.batch();
    for (const doc of days.docs.slice(i, i + chunkSize)) batch.delete(doc.ref);
    await batch.commit();
  }

  await adRef.update({ impressions: 0, clicks: 0 });
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
