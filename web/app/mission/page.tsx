import type { Metadata } from "next";

import { MissionCtaSection } from "@/components/mission/mission-cta-section";
import { MissionStanceSection } from "@/components/mission/mission-stance-section";
import { MissionStatementSection } from "@/components/mission/mission-statement-section";
import { MissionValuesSection } from "@/components/mission/mission-values-section";
import { buildMetadata } from "@/lib/metadata";
import { FeaturedIssueCard } from "@/components/home/featured-issue-card";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Mission",
    description:
      "Read the publication's mission, values, and editorial stance.",
    path: "/mission",
  });
}

export default function MissionPage() {
  return (
    <div className="container space-y-8 py-8 pb-16 sm:py-10 lg:space-y-10 lg:py-14">
      <MissionStatementSection />
      <MissionValuesSection />
      <MissionStanceSection />
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        Continue Reading
      </p>
      <FeaturedIssueCard />
      {/* <MissionCtaSection /> */}
    </div>
  );
}
