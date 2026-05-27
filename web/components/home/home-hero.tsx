import Image from "next/image";

import { listIssues } from "@/lib/content/issues";
import { FeaturedIssueCard } from "./featured-issue-card";
import { HomeHeroContent } from "./home-hero-content";

export function HomeHero() {
  const [primaryIssue, secondaryIssue] = listIssues();

  return (
    <section className="relative -mt-[100px] overflow-hidden">
      <Image
        src="/blob-scene-haikei (1).svg"
        alt=""
        fill
        aria-hidden
        className="pointer-events-none object-cover object-center -z-30 opacity-90"
        sizes="100vw"
        priority
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-background via-background/85 to-background/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative grid min-h-screen lg:grid-cols-3">
        <div className="lg:col-span-2 flex items-center">
          <HomeHeroContent
            primaryIssue={primaryIssue}
            secondaryIssue={secondaryIssue}
          />
        </div>

        <div className="hidden lg:flex items-center justify-center px-8 pb-16 pt-[calc(100px+3rem)] xl:px-12">
          <div className="grid w-full max-w-[340px] gap-4">
            <FeaturedIssueCard
              issue={primaryIssue}
              aspectClass="aspect-[3/4]"
              priority
            />
            {secondaryIssue ? (
              <FeaturedIssueCard
                issue={secondaryIssue}
                badgeLabel="Previous Issue"
                aspectClass="aspect-[16/10]"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
