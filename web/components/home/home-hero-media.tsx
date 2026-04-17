import Image from "next/image";

import { homeHeroContent } from "@/lib/content/home-content";

export function HomeHeroMedia() {
  return (
    <div className="order-1 -mx-5 -mt-6 w-auto overflow-hidden rounded-none sm:-mx-8 sm:-mt-8 lg:order-2 lg:mx-0 lg:mt-0 lg:w-full lg:self-start lg:rounded-[2rem]">
      {/* <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" /> */}
      <Image
        src={homeHeroContent.coverImageUrl}
        alt={homeHeroContent.coverImageAlt}
        width={158}
        height={189}
        priority
        className="block h-auto w-full"
        sizes="(min-width: 1024px) 38vw, 100vw"
      />
      {/* <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="rounded-[1.5rem] border border-border/80 bg-card/88 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Editorial Cover
          </p>
          <p className="mt-2 font-heading text-2xl leading-tight">
            One issue, one clear invitation into the magazine.
          </p>
        </div>
      </div> */}
    </div>
  );
}
