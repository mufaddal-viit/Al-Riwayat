"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { getPlacement, type PlacementKey } from "@/lib/ads/placements";
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

/**
 * Renders the best live ad for a placement, or nothing.
 *
 * - Fetches on mount; if no ad is eligible the component renders `null` and the
 *   surrounding layout collapses (no empty box, no reserved gap).
 * - Responsive: a mobile creative is served to small screens via <picture>,
 *   falling back to the desktop image. The image fills the placement's aspect
 *   frame with object-cover, capped in width so it never dominates the page.
 * - A subtle gray shade along the top edge carries the "Sponsored" label.
 * - The whole ad links out (new tab / rel="sponsored") when a link is set.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  const [ad, setAd] = useState<ServedAd | null>(null);
  const config = getPlacement(placement);
  const figureRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    const device =
      typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches
        ? "mobile"
        : "desktop";
    fetchAds(placement, device).then((ads) => {
      if (active) setAd(ads[0] ?? null);
    });
    return () => {
      active = false;
    };
  }, [placement]);

  // Count an impression once the ad has been ≥50% visible for ≥1s — "seen",
  // not merely loaded. De-duplication per page load lives in the tracker.
  useEffect(() => {
    const node = figureRef.current;
    if (!ad || !node || typeof IntersectionObserver === "undefined") return;

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
  }, [ad]);

  if (!ad || !config) return null;

  const desktopSrc = ad.desktopImageUrl;
  const mobileSrc = ad.mobileImageUrl || ad.desktopImageUrl;
  if (!desktopSrc) return null;

  const href = buildAdHref(ad);

  const media = (
    <figure
      ref={figureRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-muted",
        config.frameClass,
      )}
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
          className="h-full w-full object-cover"
        />
      </picture>
    </figure>
  );

  return (
    <aside
      aria-label="Sponsored content"
      className={cn("mx-auto w-full", config.maxWidthClass, className)}
    >
      {href ? (
        <a
          href={href}
          target={ad.openInNewTab ? "_blank" : undefined}
          rel="sponsored noopener noreferrer"
          onClick={() => trackClick(ad.id)}
          className="block transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {media}
        </a>
      ) : (
        media
      )}
    </aside>
  );
}
