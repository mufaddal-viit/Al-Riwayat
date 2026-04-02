import type { Metadata } from "next";

import { AboutPreviewSection } from "@/components/home/about-preview-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
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
    <div className="container space-y-8 py-8 pb-16 sm:py-10 lg:space-y-10 lg:py-6">
      <HomeHero />
      {/* <AboutPreviewSection /> */}

      {/* <CommentsSection /> */}
      <NewsletterPreviewSection />
    </div>
  );
}
