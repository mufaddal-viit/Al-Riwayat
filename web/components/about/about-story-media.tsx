import Image from "next/image";

import { aboutStory } from "@/lib/content/about-content";

export function AboutStoryMedia() {
  return (
    <>
      <Image
        src={aboutStory.imageUrl}
        alt=""
        fill
        aria-hidden
        priority
        sizes="100vw"
        className="pointer-events-none -z-30 object-cover object-center opacity-60 lg:object-right"
      />

      {/* Left-to-right wash — keeps text readable, lets the image bleed on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-background via-background/85 to-background/10"
      />

      {/* Soft fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-background"
      />
    </>
  );
}
