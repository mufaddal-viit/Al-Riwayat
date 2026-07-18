import { publicEnv } from "@/lib/public-env";
import type { PlacementKey } from "@/lib/ads/placements";

export interface ServedAd {
  id: string;
  mediaType: "image" | "video";
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

/**
 * Fetch live ads for a placement. Talks to the public serving endpoint on the
 * API. Never throws — on any failure it resolves to an empty list so a reader
 * page renders no ad rather than an error.
 */
export async function fetchAds(
  placement: PlacementKey,
  device?: "mobile" | "desktop",
): Promise<ServedAd[]> {
  try {
    const params = new URLSearchParams({ placement });
    if (device) params.set("device", device);
    const response = await fetch(`${publicEnv.apiUrl}/ads?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const payload = (await response.json().catch(() => ({}))) as {
      data?: ServedAd[];
    };
    return payload.data ?? [];
  } catch {
    return [];
  }
}
