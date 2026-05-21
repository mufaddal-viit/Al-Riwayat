import { aboutStory } from "@/lib/content/about-content";

import { AboutEyebrow } from "./about-eyebrow";

export function AboutStoryContent() {
  return (
    <div className="flex w-full flex-col gap-8 pb-16 pt-[calc(100px+3rem)] lg:pb-24 lg:pt-[calc(100px+4rem)]">
      <AboutEyebrow>{aboutStory.eyebrow}</AboutEyebrow>

      <h1 className="balanced-wrap font-heading text-4xl leading-[1.05] sm:text-5xl lg:text-7xl xl:text-8xl 2xl:text-[9rem]">
        A magazine built for readers who still want{" "}
        <span className="text-primary italic">depth.</span>
      </h1>

      <p className="max-w-4xl text-base leading-relaxed text-foreground/80 sm:text-lg lg:text-xl xl:max-w-5xl">
        {aboutStory.introduction}
      </p>

      <div className="max-w-4xl space-y-5 text-base leading-relaxed text-muted-foreground sm:text-[17px] lg:text-lg xl:max-w-5xl">
        {aboutStory.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
