import type { Metadata } from "next";
import Image from "next/image";

import { ContributeCTA } from "@/components/contribute/contribute-cta";
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

export default function ContributePage() {
  return (
    <div className="container space-y-16 py-10 pb-20 sm:py-12 lg:space-y-24 lg:py-16">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="order-2 space-y-5 lg:order-1 lg:space-y-7">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden className="h-px w-7 bg-primary" />
            {contributeIntro.eyebrow}
          </p>

          <h1 className="balanced-wrap font-heading font-extrabold italic leading-[0.95] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
            {contributeIntro.title1}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {contributeIntro.description}
          </p>
        </div>

        <div className="relative order-1 aspect-[5/4] w-full overflow-hidden rounded-tr-[2rem] rounded-bl-[2rem] sm:aspect-[16/10] lg:order-2 lg:aspect-[4/5]">
          <Image
            src={heroImageUrl}
            alt="An open journal resting on a desk — an invitation to write."
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>
      </section>

      {/* Guidelines */}
      <section className="space-y-10 lg:space-y-12">
        <div
          role="separator"
          aria-label="Submission guidelines"
          className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
        >
          <span aria-hidden className="h-px flex-1 bg-border" />
          Submission guidelines
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        <h2 className="balanced-wrap mx-auto max-w-3xl text-center font-heading text-3xl sm:text-4xl lg:text-5xl">
          {contributeIntro.heroText}
        </h2>

        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-10">
          {submissionGuidelines.map((item, index) => (
            <li key={item.id} className="space-y-2.5">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-2xl font-extrabold italic text-primary tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold leading-snug">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ContributeCTA />
    </div>
  );
}
