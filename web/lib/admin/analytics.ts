import type {
  AdminDashboardData,
  AdminFirestoreCollection,
  AdminFirestoreDocument,
  AdminJsonValue,
} from "@/types/admin-dashboard";

// ─── Time range ───────────────────────────────────────────────────────────────

export type RangeKey = "4w" | "12w" | "6m" | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string; weeks: number | null }[] = [
  { key: "4w", label: "4 weeks", weeks: 4 },
  { key: "12w", label: "12 weeks", weeks: 12 },
  { key: "6m", label: "6 months", weeks: 26 },
  { key: "all", label: "All time", weeks: null },
];

export interface TimePoint {
  /** ISO date of the bucket start (week beginning Monday). */
  date: string;
  /** Short human label, e.g. "Apr 8". */
  label: string;
  [series: string]: string | number;
}

// ─── Collection helpers ───────────────────────────────────────────────────────

export function collectionById(
  data: AdminDashboardData | null,
  id: string,
): AdminFirestoreCollection | undefined {
  return data?.collections.find((collection) => collection.id === id);
}

export function docs(
  data: AdminDashboardData | null,
  id: string,
): AdminFirestoreDocument[] {
  return collectionById(data, id)?.documents ?? [];
}

export function total(data: AdminDashboardData | null, id: string): number {
  return collectionById(data, id)?.total ?? 0;
}

function asString(value: AdminJsonValue | undefined): string | null {
  return typeof value === "string" ? value : null;
}

// ─── Field-value breakdowns ───────────────────────────────────────────────────

/** Count documents grouped by a string field value (e.g. status, category). */
export function countByField(
  documents: AdminFirestoreDocument[],
  field: string,
): Record<string, number> {
  return documents.reduce<Record<string, number>>((acc, document) => {
    const value = asString(document.data[field]);
    if (value === null) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

/** Sum the lengths of an array-valued field across documents. */
export function sumArrayField(
  documents: AdminFirestoreDocument[],
  field: string,
): number {
  return documents.reduce((sum, document) => {
    const value = document.data[field];
    return sum + (Array.isArray(value) ? value.length : 0);
  }, 0);
}

export interface CategorySlice {
  label: string;
  value: number;
}

/** Turn a count map into a sorted array, optionally remapping labels. */
export function toSlices(
  counts: Record<string, number>,
  labelMap?: Record<string, string>,
): CategorySlice[] {
  return Object.entries(counts)
    .map(([key, value]) => ({ label: labelMap?.[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Time bucketing ───────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const weekLabelFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

/** Monday 00:00 UTC of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const copy = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = copy.getUTCDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  copy.setUTCDate(copy.getUTCDate() + diff);
  return copy;
}

/**
 * Build a contiguous weekly timeline (oldest → newest) for the chosen range,
 * counting how many of each series' documents fall in each week by their
 * `primaryDate`. Weeks with no activity are kept (zero-filled) so the line/area
 * charts render an unbroken trend.
 */
export function weeklyTimeline(
  series: { key: string; documents: AdminFirestoreDocument[] }[],
  range: RangeKey,
  now: Date = new Date(),
): TimePoint[] {
  const option = RANGE_OPTIONS.find((opt) => opt.key === range) ?? RANGE_OPTIONS[1];

  // Determine the earliest week to show.
  let earliest = startOfWeek(now);
  if (option.weeks === null) {
    // All-time: find the oldest primaryDate across every series.
    let oldest = now.getTime();
    for (const entry of series) {
      for (const document of entry.documents) {
        if (!document.primaryDate) continue;
        const time = new Date(document.primaryDate).getTime();
        if (!Number.isNaN(time) && time < oldest) oldest = time;
      }
    }
    earliest = startOfWeek(new Date(oldest));
  } else {
    earliest = new Date(startOfWeek(now).getTime() - (option.weeks - 1) * WEEK_MS);
  }

  const weekStart = earliest.getTime();
  const currentWeekStart = startOfWeek(now).getTime();
  const weekCount = Math.max(
    1,
    Math.round((currentWeekStart - weekStart) / WEEK_MS) + 1,
  );

  // Initialize zero-filled buckets.
  const buckets: TimePoint[] = Array.from({ length: weekCount }, (_, i) => {
    const start = new Date(weekStart + i * WEEK_MS);
    const point: TimePoint = {
      date: start.toISOString(),
      label: weekLabelFormatter.format(start),
    };
    for (const entry of series) point[entry.key] = 0;
    return point;
  });

  const indexFor = (iso: string): number => {
    const time = new Date(iso).getTime();
    if (Number.isNaN(time)) return -1;
    const idx = Math.floor((startOfWeek(new Date(time)).getTime() - weekStart) / WEEK_MS);
    return idx >= 0 && idx < weekCount ? idx : -1;
  };

  for (const entry of series) {
    for (const document of entry.documents) {
      if (!document.primaryDate) continue;
      const idx = indexFor(document.primaryDate);
      if (idx === -1) continue;
      buckets[idx][entry.key] = (buckets[idx][entry.key] as number) + 1;
    }
  }

  return buckets;
}

/** Cumulative running total of a single series over the timeline (for growth charts). */
export function cumulative(points: TimePoint[], key: string): TimePoint[] {
  let runningTotal = 0;
  return points.map((point) => {
    runningTotal += (point[key] as number) ?? 0;
    return { ...point, [key]: runningTotal };
  });
}

// ─── Sparkline series (last N weekly counts as plain numbers) ─────────────────

export function sparkSeries(
  documents: AdminFirestoreDocument[],
  weeks = 12,
  now: Date = new Date(),
): number[] {
  const timeline = weeklyTimeline(
    [{ key: "v", documents }],
    weeks <= 4 ? "4w" : weeks <= 12 ? "12w" : "6m",
    now,
  );
  return timeline.map((point) => point.v as number);
}

// ─── "Needs attention" actionable counts ──────────────────────────────────────

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  tone: "warning" | "danger" | "info";
  tab: string;
}

export function attentionItems(data: AdminDashboardData | null): AttentionItem[] {
  const submissionStatus = countByField(docs(data, "submissions"), "status");
  const commentStatus = countByField(docs(data, "comments"), "status");

  const items: AttentionItem[] = [
    {
      id: "pending-contributions",
      label: "Contributions awaiting review",
      count: submissionStatus.pending ?? 0,
      tone: "warning",
      tab: "contributions",
    },
    {
      id: "pending-comments",
      label: "Comments awaiting moderation",
      count: commentStatus.PENDING ?? 0,
      tone: "warning",
      tab: "comments",
    },
    {
      id: "spam-comments",
      label: "Comments flagged as spam",
      count: commentStatus.SPAM ?? 0,
      tone: "danger",
      tab: "comments",
    },
    {
      id: "contact-messages",
      label: "Contact messages",
      count: total(data, "contacts"),
      tone: "info",
      tab: "contacts",
    },
  ];

  return items.filter((item) => item.count > 0);
}
