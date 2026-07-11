import type { Metadata } from "next";

import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { SocialBentoSection } from "@/components/home/social-bento-section";
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
      <div className="container space-y-20 py-16 pb-24 lg:space-y-28 lg:py-20">
        <SocialBentoSection />
        <ReaderEngagementSection />
        <NewsletterPreviewSection />
      </div>
    </>
  );
}
