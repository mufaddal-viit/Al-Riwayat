import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatContributionDate } from "@/lib/content/contributions";
import type { Contribution } from "@/types/api";

type ContributionCardProps = {
  contribution: Contribution;
};

/** Rough reading time from the excerpt/body length. */
function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * A single, consistent editorial card for every contribution — works with or
 * without a cover image, so the grid reads as one coherent set. The whole card
 * is a link to the full piece.
 */
export function ContributionCard({ contribution }: ContributionCardProps) {
  const href = `/contributions/${contribution.slug}`;
  const date = formatContributionDate(contribution.publishedAt);
  const hasCover = Boolean(contribution.coverImageUrl);

  return (
    <Link
      href={href}
      aria-label={`Read "${contribution.title}" by ${contribution.author}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lifted transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Cover (when present) */}
      {hasCover ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={contribution.coverImageUrl!}
            alt={contribution.coverImageAlt ?? contribution.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <span className="absolute left-3 top-3">
            <Badge
              variant="outline"
              className="border-white/30 bg-black/40 text-[10px] text-white/90 backdrop-blur-sm"
            >
              {contribution.category}
            </Badge>
          </span>
        </div>
      ) : (
        // Decorative header for text-only pieces — keeps the grid uniform.
        <div className="relative flex h-24 items-center justify-between overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-muted/40 to-transparent px-5">
          <Badge variant="outline" className="text-[10px]">
            {contribution.category}
          </Badge>
          <Quote
            aria-hidden
            className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/30"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="font-heading text-xl leading-snug balanced-wrap transition-colors group-hover:text-primary sm:text-2xl">
          {contribution.title}
        </h3>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {contribution.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/50 pt-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {contribution.author}
            </p>
            <p className="text-xs text-muted-foreground">
              {date} · {readingTime(contribution.excerpt || contribution.body)}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-all duration-200 group-hover:gap-2.5">
            Read
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
