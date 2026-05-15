"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { usePublishedMagazines } from "@/hooks/useMagazines";
import type { Magazine } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

type FeaturedIssueCardProps = {
  aspectClass?: string;
};

export function FeaturedIssueCard({ aspectClass }: FeaturedIssueCardProps = {}) {
  const { magazines, loading, error } = usePublishedMagazines();
  const featured: Magazine | undefined = magazines[0];
  const aspect = aspectClass ?? "aspect-[3/4] sm:aspect-[16/9]";

  if (loading) {
    return (
      <Skeleton className={`w-full rounded-2xl ${aspect}`} />
    );
  }

  if (error || !featured) {
    return (
      <div className={`w-full rounded-2xl bg-muted flex items-center justify-center ${aspect}`}>
        <p className="text-muted-foreground text-sm">
          Couldn&apos;t load the latest issue.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/issue/${featured.slug}`}
      className={`group relative block w-full overflow-hidden rounded-2xl shadow-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${aspect}`}
      aria-label={`Read featured issue: ${featured.title}`}
    >
      <Image
        src={featured.coverImageUrl}
        alt={featured.coverImageAlt}
        fill
        priority
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
        sizes="(min-width: 1024px) 800px, 100vw"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
      />

      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 sm:p-8">
        <Badge
          variant="outline"
          className="w-fit border-white/30 bg-white/10 text-white/90 backdrop-blur-sm text-[11px] uppercase tracking-widest"
        >
          Featured Issue
        </Badge>

        <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl leading-tight text-white balanced-wrap">
          {featured.title}
        </h3>

        <p className="text-sm text-white/70 leading-relaxed line-clamp-2 max-w-xl">
          {featured.summary}
        </p>

        <div className="flex items-center gap-2 text-sm font-medium text-white/90 transition-all duration-200 group-hover:gap-3">
          <span>Read Now</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
