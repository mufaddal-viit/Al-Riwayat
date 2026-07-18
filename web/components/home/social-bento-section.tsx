import Link from "next/link";
import { Instagram } from "lucide-react";

import { InstagramCommentsMarquee } from "@/components/home/instagram-comments-marquee";
import { InstagramReelsCarousel } from "@/components/home/instagram-reels-carousel";
import { AdSlot } from "@/components/ads/ad-slot";
import { socialBentoContent } from "@/lib/content/social-bento-content";

export function SocialBentoSection() {
  const {
    eyebrow,
    title,
    titleHighlight,
    description,
    cta,
    reels,
    comments,
  } = socialBentoContent;

  return (
    <section aria-label="From the community" className="w-full space-y-12">
      {/* Section divider */}
      <div
        role="separator"
        aria-label={eyebrow}
        className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
      >
        <span aria-hidden className="h-px flex-1 bg-border" />
        {eyebrow}
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      {/* Heading + CTA */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h2 className="font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {title} <em className="not-italic text-primary">{titleHighlight}</em>
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <Link
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] shadow-lifted transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Instagram
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:scale-110"
          />
          {cta.label}
        </Link>
      </div>

      {/* Reels carousel */}
      <InstagramReelsCarousel reels={reels} />

      {/* Sponsored slot (renders nothing when no ad is live) */}
      <AdSlot placement="home-social" />

      {/* Comments marquee */}
      <InstagramCommentsMarquee comments={comments} />
    </section>
  );
}
