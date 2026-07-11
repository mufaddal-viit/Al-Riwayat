import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { homeHeroContent } from "@/lib/content/home-content";
import type { IssueContent } from "@/lib/content/issues";
import { FeaturedIssueCard } from "./featured-issue-card";

type HomeHeroContentProps = {
  primaryIssue?: IssueContent;
  secondaryIssue?: IssueContent;
};

export function HomeHeroContent({
  primaryIssue,
  secondaryIssue,
}: HomeHeroContentProps) {
  return (
    <div className="flex flex-col w-full justify-center gap-8 px-6 pb-12 pt-[calc(100px+3rem)] sm:px-10 lg:px-14 lg:pb-20 lg:pt-[calc(100px+4rem)]">
      <div className="space-y-7">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-7 bg-primary" />
          {homeHeroContent.eyebrow} · Out now
        </p>

        <div className="space-y-5">
          <h1 className="w-full max-w-3xl text-[2.5rem] font-extrabold leading-[1.05] sm:text-5xl lg:text-7xl">
            {homeHeroContent.title}{" "}
            <span className="text-primary">{homeHeroContent.titleHighlight}</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
            {homeHeroContent.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="group h-12 gap-2 px-7 text-sm font-semibold">
            <Link href={homeHeroContent.primaryCta.href}>
              {homeHeroContent.primaryCta.label}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold">
            <Link href={homeHeroContent.secondaryCta.href}>
              {homeHeroContent.secondaryCta.label}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        <FeaturedIssueCard
          issue={primaryIssue}
          aspectClass="aspect-[3/4]"
          priority
        />
        {secondaryIssue ? (
          <FeaturedIssueCard
            issue={secondaryIssue}
            badgeLabel="Previous Issue"
            aspectClass="aspect-[4/5]"
          />
        ) : null}
      </div>
    </div>
  );
}
