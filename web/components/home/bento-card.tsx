"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BentoCardItem } from "@/lib/content/social-bento-content";
import { cn } from "@/lib/utils";

/** Span classes keyed by the bento layout role. Mobile is always 1-wide. */
const spanClass: Record<BentoCardItem["span"], string> = {
  feature: "sm:col-span-2 sm:row-span-2",
  tall: "sm:row-span-2",
  wide: "sm:col-span-2",
  default: "",
};

type BentoCardProps = {
  item: BentoCardItem;
  className?: string;
  priority?: boolean;
};

export function BentoCard({
  item,
  className,
  priority = false,
}: BentoCardProps) {
  const isFeature = item.span === "feature";

  const wrapperClassName = cn(
    "group relative block overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-lifted",
    "transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    item.href &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    spanClass[item.span],
    className,
  );

  const inner = (
    <>
      {item.kind === "video" ? (
        <BentoVideo item={item} />
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          priority={priority}
          sizes={
            isFeature
              ? "(min-width: 1024px) 520px, (min-width: 640px) 60vw, 100vw"
              : "(min-width: 640px) 30vw, 100vw"
          }
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}

      {/* Readability wash — stronger near the bottom for caption text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
      />

      {/* Caption — only when provided (typically the reels). */}
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p
            className={cn(
              "font-heading leading-tight text-white",
              isFeature ? "text-xl sm:text-2xl" : "text-base",
            )}
          >
            {item.caption}
          </p>
        </div>
      )}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open on Instagram: ${item.alt}`}
        className={wrapperClassName}
      >
        {inner}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{inner}</div>;
}

/**
 * Lazily-played video: muted, loops, and only starts once it scrolls into
 * view (and pauses when it leaves) so several reels can coexist cheaply.
 */
function BentoVideo({ item }: { item: BentoCardItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    if (inView) {
      void node.play().catch(() => {
        /* Autoplay can be blocked — poster stays visible, no-op. */
      });
    } else {
      node.pause();
    }
  }, [inView]);

  return (
    <video
      ref={videoRef}
      src={item.src}
      poster={item.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={item.alt}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}
