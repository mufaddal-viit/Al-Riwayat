"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContributionsGrid } from "@/components/contributions/contributions-grid";
import { useContributions } from "@/hooks/useContributions";

export function ContributionsPageClient() {
  const { contributions, loading } = useContributions();

  return (
    <div className="container space-y-12 py-10 pb-20 sm:py-12 lg:space-y-16 lg:py-16">
      {/* Intro */}
      <section className="space-y-5">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-7 bg-primary" />
          Contributions
        </p>
        <h1 className="balanced-wrap max-w-3xl font-heading text-4xl sm:text-5xl lg:text-6xl">
          Voices from the community
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Stories, poetry, and reflections shared by Bohra youth in their own
          words. Read what others have penned down — then share a piece of your
          own.
        </p>
      </section>

      {/* Grid */}
      <ContributionsGrid contributions={contributions} loading={loading} />

      {/* Closing CTA — convert readers into contributors */}
      <section className="flex flex-col items-center gap-5 rounded-[2rem] border border-border bg-card/80 px-6 py-12 text-center shadow-editorial sm:px-10">
        <h2 className="font-heading text-2xl sm:text-3xl">
          Have a story to share?
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your perspective matters. Submissions are always open.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/contribute">
            Share your story
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
