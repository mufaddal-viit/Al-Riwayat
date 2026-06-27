"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContributionShareActions } from "@/components/contributions/contribution-share-actions";
import { formatContributionDate } from "@/lib/content/contributions";
import { useContribution } from "@/hooks/useContributions";

function ContributionSkeleton() {
  return (
    <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:py-14">
      <Skeleton className="min-h-[240px] w-full rounded-[1.5rem] sm:min-h-[360px] sm:rounded-[2.5rem]" />
      <div className="mx-auto max-w-[72ch] space-y-4">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-1/3 rounded-xl" />
        <Skeleton className="h-5 w-full rounded-xl" />
        <Skeleton className="h-5 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ContributionNotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-heading text-4xl">Contribution not found</h1>
      <p className="text-muted-foreground">
        This piece does not exist or has been removed.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/contributions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to contributions
        </Link>
      </Button>
    </div>
  );
}

export function ContributionPageClient({ slug }: { slug: string }) {
  const { contribution, status } = useContribution(slug);

  if (status === "loading") return <ContributionSkeleton />;
  if (status === "not_found" || status === "error" || !contribution) {
    return <ContributionNotFound />;
  }

  const paragraphs = contribution.body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article className="container space-y-10 py-8 pb-20 sm:py-10 lg:space-y-12 lg:py-14">
      <Link
        href="/contributions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" />
        All contributions
      </Link>

      {/* Cover hero (optional) */}
      {contribution.coverImageUrl ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] sm:aspect-[16/8] sm:rounded-[2.5rem]">
          <Image
            src={contribution.coverImageUrl}
            alt={contribution.coverImageAlt ?? contribution.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 1100px, 100vw"
          />
        </div>
      ) : null}

      {/* Header */}
      <header className="mx-auto max-w-[72ch] space-y-4">
        <Badge variant="outline" className="w-fit">
          {contribution.category}
        </Badge>
        <h1 className="balanced-wrap font-heading text-3xl leading-tight sm:text-4xl lg:text-5xl">
          {contribution.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          By {contribution.author} ·{" "}
          {formatContributionDate(contribution.publishedAt)}
        </p>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-[72ch] space-y-5 text-base leading-relaxed sm:text-lg sm:leading-relaxed">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>

      <ContributionShareActions title={contribution.title} />

      {/* Closing CTA */}
      <section className="mx-auto flex max-w-[72ch] flex-col items-center gap-4 rounded-[2rem] border border-border bg-card/80 px-6 py-10 text-center shadow-editorial">
        <h2 className="font-heading text-2xl">Inspired to write?</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Share your own story, reflection, or poem with the Al-Riwayat
          community.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/contribute">
            Share your story
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </article>
  );
}
