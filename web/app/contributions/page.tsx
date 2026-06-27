import type { Metadata } from "next";

import { buildMetadata } from "@/lib/metadata";

import { ContributionsPageClient } from "./ContributionsPageClient";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Contributions",
    description:
      "Stories, poetry, and reflections shared by the Al-Riwayat community.",
    path: "/contributions",
  });
}

export default function ContributionsPage() {
  return <ContributionsPageClient />;
}
