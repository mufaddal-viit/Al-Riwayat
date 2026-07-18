import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type { CreateAdInput, UpdateAdInput } from "./ads.schema";
import type {
  AdChannel,
  AdMediaType,
  AdStatus,
  PlacementKey,
  TargetDevice,
} from "./ads.types";

const COLLECTION = "ads";

/** Maximum ads shown in a single slot, stacked one below the other. */
const MAX_ADS_PER_SLOT = 2;

interface AdLinks {
  website?: string;
  instagramReel?: string;
  instagramStatus?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
}

interface AdTargeting {
  devices?: TargetDevice[];
  pages?: string[];
  locales?: string[];
}

interface StoredAd {
  title: string;
  clientId?: string;
  clientName?: string;
  mediaType?: AdMediaType;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  fallbackImageUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  placements?: PlacementKey[];
  channels?: AdChannel[];
  links?: AdLinks;
  linkUrl?: string;
  openInNewTab?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status?: AdStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  weight?: number;
  targeting?: AdTargeting;
  maxImpressions?: number;
  maxClicks?: number;
  impressions?: number;
  clicks?: number;
  notes?: string;
  campaignId?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  archivedAt?: Timestamp | null;
}

export interface AdminAd {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  mediaType: AdMediaType;
  desktopImageUrl: string;
  mobileImageUrl: string;
  videoUrl: string;
  fallbackImageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  placements: PlacementKey[];
  channels: AdChannel[];
  links: Required<AdLinks>;
  linkUrl: string;
  openInNewTab: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  status: AdStatus;
  startsAt: string | null;
  endsAt: string | null;
  priority: number;
  weight: number;
  targeting: Required<AdTargeting>;
  maxImpressions: number | null;
  maxClicks: number | null;
  impressions: number;
  clicks: number;
  notes: string;
  campaignId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

/** The trimmed shape a reader page receives — no internal/commercial fields. */
export interface PublicAd {
  id: string;
  mediaType: AdMediaType;
  desktopImageUrl: string;
  mobileImageUrl: string;
  videoUrl: string;
  fallbackImageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  linkUrl: string;
  openInNewTab: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToIso(value: Timestamp | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

function toAdmin(id: string, data: StoredAd): AdminAd {
  const links = data.links ?? {};
  const targeting = data.targeting ?? {};
  return {
    id,
    title: data.title ?? "Untitled",
    clientId: data.clientId ?? "",
    clientName: data.clientName ?? "",
    mediaType: data.mediaType ?? "image",
    desktopImageUrl: data.desktopImageUrl ?? "",
    mobileImageUrl: data.mobileImageUrl ?? "",
    videoUrl: data.videoUrl ?? "",
    fallbackImageUrl: data.fallbackImageUrl ?? "",
    alt: data.alt ?? "",
    width: data.width ?? null,
    height: data.height ?? null,
    placements: data.placements ?? [],
    channels: data.channels ?? [],
    links: {
      website: links.website ?? "",
      instagramReel: links.instagramReel ?? "",
      instagramStatus: links.instagramStatus ?? "",
      whatsappPhone: links.whatsappPhone ?? "",
      whatsappMessage: links.whatsappMessage ?? "",
    },
    linkUrl: data.linkUrl ?? "",
    openInNewTab: data.openInNewTab ?? true,
    utmSource: data.utmSource ?? "",
    utmMedium: data.utmMedium ?? "",
    utmCampaign: data.utmCampaign ?? "",
    status: data.status ?? "draft",
    startsAt: data.startsAt ?? null,
    endsAt: data.endsAt ?? null,
    priority: data.priority ?? 0,
    weight: data.weight ?? 1,
    targeting: {
      devices: targeting.devices ?? [],
      pages: targeting.pages ?? [],
      locales: targeting.locales ?? [],
    },
    maxImpressions: data.maxImpressions ?? null,
    maxClicks: data.maxClicks ?? null,
    impressions: data.impressions ?? 0,
    clicks: data.clicks ?? 0,
    notes: data.notes ?? "",
    campaignId: data.campaignId ?? "",
    createdBy: data.createdBy ?? "",
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: tsToIso(data.updatedAt) ?? new Date(0).toISOString(),
    archivedAt: tsToIso(data.archivedAt),
  };
}

function toPublic(ad: AdminAd): PublicAd {
  return {
    id: ad.id,
    mediaType: ad.mediaType,
    desktopImageUrl: ad.desktopImageUrl,
    mobileImageUrl: ad.mobileImageUrl,
    videoUrl: ad.videoUrl,
    fallbackImageUrl: ad.fallbackImageUrl,
    alt: ad.alt,
    width: ad.width,
    height: ad.height,
    linkUrl: ad.linkUrl,
    openInNewTab: ad.openInNewTab,
  };
}

function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function listAds(filters?: {
  status?: AdStatus;
  placement?: PlacementKey;
  clientId?: string;
}): Promise<AdminAd[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs
    .map((d) => toAdmin(d.id, d.data() as StoredAd))
    .filter((a) => !filters?.status || a.status === filters.status)
    .filter(
      (a) => !filters?.placement || a.placements.includes(filters.placement),
    )
    .filter((a) => !filters?.clientId || a.clientId === filters.clientId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function findAdById(id: string): Promise<AdminAd | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toAdmin(doc.id, doc.data() as StoredAd);
}

// ─── Public serving ───────────────────────────────────────────────────────────

/**
 * Return live, eligible ads for a placement, best-first.
 *
 * Firestore allows a range filter on only one field per query, so we filter by
 * placement + status + startsAt <= now in the query, then apply the endsAt
 * window, impression/click caps, and device targeting in code. A slot has few
 * eligible ads, so this is cheap. Ordering is by priority (desc) then weight.
 */
export async function serveAds(
  placement: PlacementKey,
  device?: TargetDevice,
): Promise<PublicAd[]> {
  const db = getAdminDb();
  const nowIso = new Date().toISOString();

  // Query on the single placements array (array-contains is auto-indexed — no
  // composite index to deploy). Status / schedule window / caps / targeting
  // are applied in code below. A slot holds only a handful of ads, cheap.
  const snap = await db
    .collection(COLLECTION)
    .where("placements", "array-contains", placement)
    .get();

  const eligible = snap.docs
    .map((d) => toAdmin(d.id, d.data() as StoredAd))
    .filter((ad) => {
      if (ad.status !== "published") return false;
      if (ad.startsAt && ad.startsAt > nowIso) return false; // not started yet
      if (ad.endsAt && ad.endsAt < nowIso) return false; // already ended
      if (ad.maxImpressions !== null && ad.impressions >= ad.maxImpressions) {
        return false;
      }
      if (ad.maxClicks !== null && ad.clicks >= ad.maxClicks) return false;
      if (
        device &&
        ad.targeting.devices.length > 0 &&
        !ad.targeting.devices.includes(device)
      ) {
        return false;
      }
      // A published ad must have at least a desktop creative to render.
      return Boolean(ad.desktopImageUrl || ad.videoUrl);
    })
    .sort((a, b) => b.priority - a.priority || b.weight - a.weight);

  // At most two ads per slot, shown stacked one below the other.
  return eligible.slice(0, MAX_ADS_PER_SLOT).map(toPublic);
}

// ─── Admin writes ─────────────────────────────────────────────────────────────

export async function createAd(
  input: CreateAdInput,
  createdBy: string,
): Promise<AdminAd> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();

  await ref.set(
    defined({
      ...input,
      // startsAt must exist for the serving range filter; default to now.
      startsAt: input.startsAt ?? new Date().toISOString(),
      endsAt: input.endsAt ?? null,
      impressions: 0,
      clicks: 0,
      createdBy,
      archivedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }),
  );

  const created = await ref.get();
  return toAdmin(created.id, created.data() as StoredAd);
}

export async function updateAd(
  id: string,
  input: UpdateAdInput,
): Promise<AdminAd | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const patch: Record<string, unknown> = defined({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (input.endsAt !== undefined) patch.endsAt = input.endsAt ?? null;
  if (input.status === "archived") patch.archivedAt = FieldValue.serverTimestamp();
  else if (input.status) patch.archivedAt = null;

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredAd);
}

async function setStatus(id: string, status: AdStatus): Promise<AdminAd | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const patch: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (status === "archived") patch.archivedAt = FieldValue.serverTimestamp();
  else patch.archivedAt = null;
  // Ensure a startsAt exists so a just-published ad is immediately servable.
  if (status === "published") {
    const data = existing.data() as StoredAd;
    if (!data.startsAt) patch.startsAt = new Date().toISOString();
  }

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredAd);
}

export const publishAd = (id: string) => setStatus(id, "published");
export const unpublishAd = (id: string) => setStatus(id, "draft");
export const archiveAd = (id: string) => setStatus(id, "archived");

export async function deleteAd(id: string): Promise<AdminAd | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;
  const snapshot = toAdmin(existing.id, existing.data() as StoredAd);
  await ref.delete();
  return snapshot;
}
