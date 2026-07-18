import { publicEnv } from "@/lib/public-env";

type AdEventType = "impression" | "click";
type Device = "mobile" | "desktop";

interface QueuedEvent {
  adId: string;
  type: AdEventType;
  device?: Device;
}

/**
 * Client-side ad event tracker.
 *
 * Buffers impression/click events and flushes them as one batch to the public
 * ingest endpoint every few seconds (and on tab hide / unload via sendBeacon,
 * so events survive navigation). Impressions are de-duplicated per page load
 * so a single viewing counts once, no matter how often the ad scrolls in and
 * out of view.
 */

const FLUSH_INTERVAL_MS = 4000;
const MAX_BATCH = 40;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersBound = false;
const seenImpressions = new Set<string>();

function endpoint(): string {
  return `${publicEnv.apiUrl}/ads/events`;
}

function currentDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 639px)").matches ? "mobile" : "desktop";
}

function flush(useBeacon = false): void {
  if (queue.length === 0) return;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);

  const body = JSON.stringify({ events: batch });

  try {
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint(), new Blob([body], { type: "application/json" }));
    } else {
      void fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Tracking is best-effort; never surface failures.
      });
    }
  } catch {
    // ignore
  }

  // Drain any remainder shortly after.
  if (queue.length > 0) scheduleFlush();
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush(false);
  }, FLUSH_INTERVAL_MS);
}

function bindGlobalListeners(): void {
  if (listenersBound || typeof document === "undefined") return;
  listenersBound = true;
  // Flush reliably when the tab is hidden or the page is being unloaded.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));
}

function enqueue(event: QueuedEvent): void {
  bindGlobalListeners();
  queue.push(event);
  if (queue.length >= MAX_BATCH) flush(false);
  else scheduleFlush();
}

/** Record an impression once per page load for a given ad. */
export function trackImpression(adId: string): void {
  if (seenImpressions.has(adId)) return;
  seenImpressions.add(adId);
  enqueue({ adId, type: "impression", device: currentDevice() });
}

/** Record a click. Flushed immediately (via beacon) since navigation follows. */
export function trackClick(adId: string): void {
  enqueue({ adId, type: "click", device: currentDevice() });
  flush(true);
}
