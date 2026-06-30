import type { Metadata } from "next";

import { buildMetadata } from "@/lib/metadata";

import { WeeklyIndexClient } from "./WeeklyIndexClient";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Weekly Riwayat",
    description:
      "Short reflections and reads, published every week by the Al-Riwayat editorial desk.",
    path: "/weekly-riwayat",
  });
}

export default function WeeklyRiwayatPage() {
  return <WeeklyIndexClient />;
}
