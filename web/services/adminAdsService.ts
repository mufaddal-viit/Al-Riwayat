import type { PlacementKey } from "@/lib/ads/placements";

export type AdStatus = "draft" | "published" | "archived";
export type AdChannel =
  | "website"
  | "instagram-reel"
  | "instagram-status"
  | "whatsapp";
export type TargetDevice = "mobile" | "desktop";

export interface AdLinks {
  website: string;
  instagramReel: string;
  instagramStatus: string;
  whatsappPhone: string;
  whatsappMessage: string;
}

export interface AdTargeting {
  devices: TargetDevice[];
  pages: string[];
  locales: string[];
}

export interface AdminAd {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  mediaType: "image" | "video";
  desktopImageUrl: string;
  mobileImageUrl: string;
  videoUrl: string;
  fallbackImageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  placements: PlacementKey[];
  channels: AdChannel[];
  links: AdLinks;
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
  targeting: AdTargeting;
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

export interface AdPayload {
  title: string;
  clientId?: string;
  clientName?: string;
  mediaType?: "image" | "video";
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  fallbackImageUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  placements: PlacementKey[];
  channels?: AdChannel[];
  links?: Partial<AdLinks>;
  linkUrl?: string;
  openInNewTab?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status?: AdStatus;
  startsAt?: string;
  endsAt?: string;
  priority?: number;
  weight?: number;
  targeting?: Partial<AdTargeting>;
  maxImpressions?: number;
  maxClicks?: number;
  notes?: string;
  campaignId?: string;
}

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };
  if (!response.ok) throw new Error(payload.message ?? "Request failed.");
  return payload.data as T;
}

export async function listAds(filters?: {
  status?: AdStatus;
  placement?: PlacementKey;
  clientId?: string;
}): Promise<AdminAd[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.placement) params.set("placement", filters.placement);
  if (filters?.clientId) params.set("clientId", filters.clientId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/admin/ads${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdminAd[]>(response);
}

export async function createAd(payload: AdPayload): Promise<AdminAd> {
  const response = await fetch(`/api/admin/ads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminAd>(response);
}

export async function updateAd(
  id: string,
  payload: Partial<AdPayload>,
): Promise<AdminAd> {
  const response = await fetch(`/api/admin/ads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminAd>(response);
}

async function lifecycle(
  id: string,
  action: "publish" | "unpublish" | "archive",
): Promise<AdminAd> {
  const response = await fetch(`/api/admin/ads/${id}/${action}`, {
    method: "PATCH",
  });
  return parse<AdminAd>(response);
}

export const publishAd = (id: string) => lifecycle(id, "publish");
export const unpublishAd = (id: string) => lifecycle(id, "unpublish");
export const archiveAd = (id: string) => lifecycle(id, "archive");

export async function deleteAd(id: string): Promise<AdminAd> {
  const response = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
  return parse<AdminAd>(response);
}

/** Upload one ad image (desktop or mobile) to Cloudinary via the admin BFF. */
export async function uploadAdImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/ads-upload", {
    method: "POST",
    body: form,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    data?: { url: string; publicId: string };
    message?: string;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? "Could not upload the image.");
  }
  return payload.data;
}
