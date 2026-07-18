import type { ServedAd } from "@/services/adsService";

/**
 * Build the outbound click URL for an ad. Appends UTM params when present and
 * the destination is a real http(s) URL. Returns "" when the ad has no link,
 * signalling the caller to render a non-clickable ad.
 */
export function buildAdHref(
  ad: Pick<ServedAd, "linkUrl">,
  utm?: { source?: string; medium?: string; campaign?: string },
): string {
  const raw = ad.linkUrl?.trim();
  if (!raw) return "";

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return "";

  if (utm?.source) url.searchParams.set("utm_source", utm.source);
  if (utm?.medium) url.searchParams.set("utm_medium", utm.medium);
  if (utm?.campaign) url.searchParams.set("utm_campaign", utm.campaign);

  return url.toString();
}
