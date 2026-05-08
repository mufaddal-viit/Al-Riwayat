import Image from "next/image";

import { homeHeroContent } from "@/lib/content/home-content";

export function HomeHeroMedia() {
  return (
    <div className="relative order-1 min-h-[55vw] overflow-hidden lg:order-2 lg:min-h-full">
      <Image
        src={homeHeroContent.coverImageUrl}
        alt={homeHeroContent.coverImageAlt}
        fill
        priority
        className="object-cover object-center"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );
}
