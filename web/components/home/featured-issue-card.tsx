"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePublishedMagazines } from "@/hooks/useMagazines";
import type { Magazine } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton"; // assume or create

export function FeaturedIssueCard() {
  const { magazines, loading, error } = usePublishedMagazines();
  const featured: Magazine | undefined = magazines[0];

  if (loading) {
    return (
      <Card className="overflow-hidden border-none bg-accent text-accent-foreground shadow-editorial">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-[104px_1fr] sm:p-6">
          <Skeleton className="hidden md:block aspect-[4/5] rounded-[1.25rem]" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !featured) {
    return (
      <>
        <Card className="overflow-hidden border-none bg-accent text-accent-foreground shadow-editorial">
          <CardContent className="p-5  sm:p-6">
            <p>{error}</p>
          </CardContent>
        </Card>
      </>
    );

    // null; // or error UI
  }

  return (
    <Card className="overflow-hidden border-none bg-accent text-accent-foreground shadow-editorial">
      <CardContent className="grid gap-5 p-5 sm:grid-cols-[104px_1fr] sm:p-6">
        <div className="hidden md:block relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-border/60 bg-card">
          <Image
            src={featured.coverImageUrl}
            alt={featured.coverImageAlt}
            fill
            className="block h-auto w-full"
            sizes="(min-width: 640px) 104px, 120px"
          />
        </div>
        <div className="space-y-4">
          <Badge
            variant="outline"
            className="border-accent-foreground/20 bg-card/40"
          >
            Featured Issue
          </Badge>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl leading-tight">
              {featured.title}
            </h3>
            <p className="text-sm leading-7 text-accent-foreground/80">
              {featured.summary}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/${featured.slug}`}>Read Issue</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
