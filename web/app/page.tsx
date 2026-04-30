import type { Metadata } from "next";

import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { ReaderEngagementSection } from "@/components/issue/reader-engagement-section";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Home",
    description:
      "Read the featured issue, explore the magazine, and subscribe through a premium editorial homepage.",
    path: "/",
  });
}

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="container space-y-8 py-10 pb-16 lg:space-y-12">
        <div className="sm:block">
          <ReaderEngagementSection />
        </div>
        <NewsletterPreviewSection />
      </div>
    </>
  );
}
