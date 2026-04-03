import Link from "next/link";

import { homeHeroContent } from "@/lib/content/home-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeaturedIssueCard } from "./featured-issue-card";

export function HomeHeroContent() {
  return (
    <div className="order-2 flex flex-col justify-between gap-8 lg:order-1">
      <div className="space-y-6">
        {/* <Badge variant="outline" className="w-fit">
          {homeHeroContent.eyebrow}
        </Badge> */}
        <div className="space-y-4">
          <h1 className="balanced-wrap max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
            {homeHeroContent.title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {homeHeroContent.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* READ ISSUE 1 */}
          {/* <Badge variant="outline" className="w-fit">
            <Link href={homeHeroContent.primaryCta.href}>
              {homeHeroContent.primaryCta.label}
            </Link>
          </Badge> */}
          {/* READ ABOUT US */}
          <Button asChild variant="outline" size="default">
            <Link href={homeHeroContent.secondaryCta.href}>
              {homeHeroContent.secondaryCta.label}
            </Link>
          </Button>
        </div>

        {/* reading measures */}
        {/* <dl className="grid gap-3 rounded-[1.5rem] border border-border bg-muted/60 p-4 sm:grid-cols-3">
          {homeHeroContent.metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {metric.label}
              </dt>
              <dd className="font-heading text-2xl">{metric.value}</dd>
            </div>
          ))}
        </dl> */}
      </div>
      <FeaturedIssueCard />
    </div>
  );
}
