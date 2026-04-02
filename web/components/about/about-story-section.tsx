import Image from "next/image";

import { aboutStory } from "@/lib/content/about-content";
import { Card, CardContent } from "@/components/ui/card";

export function AboutStorySection() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden bg-card/90">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {aboutStory.eyebrow}
            </p>
            <h1 className="balanced-wrap text-4xl sm:text-5xl">
              {aboutStory.title}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {aboutStory.introduction}
            </p>
          </div>
          <div className="space-y-5 text-base text-foreground/90">
            {aboutStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-border bg-secondary/50">
          <Image
            src={aboutStory.imageUrl}
            alt="Editorial still life used to support the story section."
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 32vw, 100vw"
          />
        </div>
        <Card className="border-none bg-accent text-accent-foreground">
          <CardContent className="p-6 text-base leading-8">
            {aboutStory.sideNote}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
