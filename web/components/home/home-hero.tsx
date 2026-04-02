import Image from "next/image";
import Link from "next/link";

import { homeHeroContent } from "@/lib/content/home-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { FeaturedIssueCard } from "./featured-issue-card";

export function HomeHero() {
  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-border bg-card/90 px-5 py-6 shadow-editorial sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit">
              {homeHeroContent.eyebrow}
            </Badge>
            <div className="space-y-4">
              <h1 className="balanced-wrap max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
                {homeHeroContent.title}
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                {homeHeroContent.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={homeHeroContent.primaryCta.href}>
                  {homeHeroContent.primaryCta.label}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={homeHeroContent.secondaryCta.href}>
                  {homeHeroContent.secondaryCta.label}
                </Link>
              </Button>
            </div>
            <dl className="grid gap-3 rounded-[1.5rem] border border-border bg-muted/60 p-4 sm:grid-cols-3">
              {homeHeroContent.metrics.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {metric.label}
                  </dt>
                  <dd className="font-heading text-2xl">{metric.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <FeaturedIssueCard />
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-border bg-secondary/60">
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
          <Image
            src={homeHeroContent.coverImageUrl}
            alt={homeHeroContent.coverImageAlt}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 38vw, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <div className="rounded-[1.5rem] border border-border/80 bg-card/88 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Editorial Cover
              </p>
              <p className="mt-2 font-heading text-2xl leading-tight">
                One issue, one clear invitation into the magazine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
