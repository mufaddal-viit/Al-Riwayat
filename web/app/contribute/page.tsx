import type { Metadata } from "next";
import Image from "next/image";

import { ContributeCTA } from "@/components/contribute/contribute-cta";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";
import {
  contributeIntro,
  submissionGuidelines,
} from "@/lib/content/contribute";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Contribute",
    description:
      "We welcome submissions from Bohra youth who want to express their thoughts.",
    path: "/contribute",
  });
}

const heroImageUrl = "/images/contribute/contribute-hero.webp";
//   "https://images.unsplash.com/photo-1773332598414-44a45e364d85?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0";

export default function ContributePage() {
  return (
    <div className="container space-y-12 py-8 pb-20 sm:py-10 lg:space-y-16 lg:py-14">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="relative min-h-[560px] overflow-hidden rounded-tr-[2rem] rounded-bl-[2rem] border border-border bg-secondary/50">
          <Image
            src={heroImageUrl}
            alt="An open journal resting on a desk — an invitation to write."
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>

        <Card className="overflow-hidden bg-card/90">
          <CardContent className="flex flex-col justify-center space-y-6 p-6 sm:p-10 lg:py-16">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {contributeIntro.eyebrow}
              </p>
              <h1 className="balanced-wrap text-4xl sm:text-5xl">
                {contributeIntro.title1}
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                {contributeIntro.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Guidelines */}
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Submission guidelines
          </p>
          <h2 className="text-2xl sm:text-3xl">{contributeIntro.heroText}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissionGuidelines.map((item, index) => (
            <Card key={item.id} className="bg-card/90">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold leading-snug">
                    {item.title}
                  </h3>
                </div>
                <p className="pl-10 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ContributeCTA />
    </div>
  );
}
