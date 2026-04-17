import type { Metadata } from "next";

import { AboutStorySection } from "@/components/about/about-story-section";
import { AboutTeamSection } from "@/components/about/about-team-section";
import { ContactUsSection } from "@/components/issue/contact-us-section";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "About",
    description:
      "Learn the magazine's story, meet the editorial team, and preview the contact experience.",
    path: "/about"
  });
}

export default function AboutPage() {
  return (
    <div className="container space-y-8 py-8 pb-16 sm:py-10 lg:space-y-10 lg:py-14">
      <AboutStorySection />
      <AboutTeamSection />
      <ContactUsSection />
    </div>
  );
}
