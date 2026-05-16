import type { Metadata } from "next";

import { AboutStorySection } from "@/components/about/about-story-section";
import { AboutTeamSection } from "@/components/about/about-team-section";
import { AboutMissionSection } from "@/components/about/about-mission-section";
import { ContactUsSection } from "@/components/issue/contact-us-section";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "About",
    description:
      "Learn the magazine's story and mission, meet the editorial team, and get in touch.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <>
      <AboutStorySection />
      <div className="container space-y-20 py-16 pb-20 lg:space-y-28 lg:py-24">
        <AboutTeamSection />
        <AboutMissionSection />
        <ContactUsSection />
      </div>
    </>
  );
}
