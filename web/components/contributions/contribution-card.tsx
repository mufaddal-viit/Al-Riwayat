import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatContributionDate } from "@/lib/content/contributions";
import type { Contribution } from "@/types/api";

type ContributionCardProps = {
  contribution: Contribution;
  /** Renders a larger, full-width hero card (used for the featured piece). */
  featured?: boolean;
};

export function ContributionCard({
  contribution,
  featured = false,
}: ContributionCardProps) {
  const href = `/contributions/${contribution.slug}`;
  const meta = `${contribution.author} · ${formatContributionDate(contribution.publishedAt)}`;

  // ── Image-backed card (gradient overlay, editorial cover style) ──────────────
  if (contribution.coverImageUrl) {
    const aspect = featured
      ? "aspect-[3/4] sm:aspect-[16/9]"
      : "aspect-[4/5]";

    return (
      <Link
        href={href}
        aria-label={`Read "${contribution.title}" by ${contribution.author}`}
        className={`group relative block w-full overflow-hidden rounded-2xl shadow-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${aspect}`}
      >
        <Image
          src={contribution.coverImageUrl}
          alt={contribution.coverImageAlt ?? contribution.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          sizes={
            featured ? "(min-width: 1024px) 1100px, 100vw" : "(min-width: 1024px) 33vw, 100vw"
          }
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        />
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 sm:p-7">
          <Badge
            variant="outline"
            className="w-fit border-white/30 bg-white/10 text-white/90 backdrop-blur-sm text-[10px]"
          >
            {contribution.category}
          </Badge>
          <h3
            className={`font-heading leading-tight text-white balanced-wrap ${
              featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {contribution.title}
          </h3>
          <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/75">
            {contribution.excerpt}
          </p>
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-white/60">{meta}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-white/90 transition-all duration-200 group-hover:gap-2.5">
              Read
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Typographic card (poetry / reflections without a cover) ──────────────────
  return (
    <Link
      href={href}
      aria-label={`Read "${contribution.title}" by ${contribution.author}`}
      className="group relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lifted transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-7"
    >
      <div className="space-y-4">
        <Badge variant="outline" className="w-fit text-[10px]">
          {contribution.category}
        </Badge>
        <h3 className="font-heading text-xl leading-tight balanced-wrap sm:text-2xl">
          {contribution.title}
        </h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {contribution.excerpt}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 pt-4">
        <span className="text-xs text-muted-foreground">{meta}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-all duration-200 group-hover:gap-2.5">
          Read
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
