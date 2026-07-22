"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getPlacement, type PlacementConfig, type PlacementKey } from "@/lib/ads/placements";
import { fetchAds, type ServedAd } from "@/services/adsService";
import { buildAdHref } from "@/lib/ads/link";
import { trackClick, trackImpression } from "@/lib/ads/tracking";

/** Default label; change here to relabel every ad site-wide. */
const SPONSORED_LABEL = "Sponsored";

interface AdSlotProps {
  placement: PlacementKey;
  /** Extra classes for the outer wrapper (e.g. vertical spacing at the site). */
  className?: string;
}

/** One rendered ad creative, with its own viewability-based impression. */
function AdCreative({ ad, config }: { ad: ServedAd; config: PlacementConfig }) {
  const figureRef = useRef<HTMLElement | null>(null);

  // Count an impression once the ad has been ≥50% visible for ≥1s — "seen",
  // not merely loaded. De-duplication per page load lives in the tracker.
  useEffect(() => {
    const node = figureRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          if (!dwellTimer) {
            dwellTimer = setTimeout(() => {
              trackImpression(ad.id);
              observer.disconnect();
            }, 1000);
          }
        } else if (dwellTimer) {
          clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      observer.disconnect();
    };
  }, [ad.id]);

  const desktopSrc = ad.desktopImageUrl;
  const mobileSrc = ad.mobileImageUrl || ad.desktopImageUrl;
  if (!desktopSrc) return null;

  const href = buildAdHref(ad);

  const media = (
    <figure
      ref={figureRef}
      className="relative overflow-hidden rounded-2xl border border-border/50"
    >
      {/* Sponsored label — soft gray shade along the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end bg-gradient-to-b from-black/40 to-transparent px-3 pb-6 pt-1.5"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/85">
          {SPONSORED_LABEL}
        </span>
      </div>

      <picture>
        <source media="(max-width: 639px)" srcSet={mobileSrc} />
        {/* eslint-disable-next-line @next/next/no-img-element -- ad creatives have variable, unknown aspect ratios */}
        <img
          src={desktopSrc}
          alt={ad.alt}
          loading="lazy"
          decoding="async"
          // Natural aspect ratio, never cropped. The creative fills the slot
          // width when it can; if that would make it taller than the cap, the
          // height wins and the image scales down (centred) instead of being
          // cut off. `w-auto` lets the height cap actually take effect.
          className={cn(
            "mx-auto block h-auto w-auto max-w-full object-contain",
            config.frameClass,
          )}
        />
      </picture>
    </figure>
  );

  if (!href) return media;

  return (
    <a
      href={href}
      target={ad.openInNewTab ? "_blank" : undefined}
      rel="sponsored noopener noreferrer"
      onClick={() => trackClick(ad.id)}
      className="block transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {media}
    </a>
  );
}

/**
 * Renders up to two live ads for a placement, stacked one below the other — or
 * nothing.
 *
 * - Fetches on mount; an empty result renders `null` and the surrounding layout
 *   collapses (no empty box, no reserved gap).
 * - Responsive: a mobile creative is served to small screens via <picture>,
 *   falling back to the desktop image; object-cover in the placement frame,
 *   width-capped so it never dominates the page.
 * - A subtle gray top-shade carries the "Sponsored" label; each ad links out
 *   (rel="sponsored", new tab) when a link is set.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  const [ads, setAds] = useState<ServedAd[]>([]);
  const config = getPlacement(placement);

  useEffect(() => {
    let active = true;
    const device =
      typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
        ? "mobile"
        : "desktop";
    fetchAds(placement, device).then((result) => {
      if (active) setAds(result);
    });
    return () => {
      active = false;
    };
  }, [placement]);

  if (!config || ads.length === 0) return null;

  return (
    <aside
      aria-label="Sponsored content"
      className={cn("mx-auto w-full space-y-4", config.maxWidthClass, className)}
    >
      {ads.map((ad) => (
        <AdCreative key={ad.id} ad={ad} config={config} />
      ))}
    </aside>
  );
}
