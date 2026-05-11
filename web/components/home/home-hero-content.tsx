import Link from "next/link";

import { homeHeroContent } from "@/lib/content/home-content";
import { Button } from "@/components/ui/button";
import { FeaturedIssueCard } from "./featured-issue-card";

export function HomeHeroContent() {
  return (
    <div className="flex flex-col w-full justify-center gap-8 px-6 pb-12 pt-[calc(100px+3rem)] sm:px-10 lg:px-14 lg:pb-20 lg:pt-[calc(100px+4rem)]">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="w-full text-4xl sm:text-5xl lg:text-7xl font-extrabold">
            {homeHeroContent.title}{" "}
            <span className="text-primary">{homeHeroContent.titleHighlight}</span>
          </h1>
          <p className="max-w-lg text-base text-foreground/80 sm:text-lg line-clamp-3">
            {homeHeroContent.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="default">
            <Link href={homeHeroContent.secondaryCta.href}>
              {homeHeroContent.secondaryCta.label}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile only — desktop sees it in the right hero column */}
      <div className="lg:hidden">
        <FeaturedIssueCard aspectClass="h-[62svh] w-full sm:h-auto sm:aspect-[16/9]" />
      </div>
    </div>
  );
}
