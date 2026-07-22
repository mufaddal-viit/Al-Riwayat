import { ImageResponse } from "next/og";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { publicEnv } from "@/lib/public-env";
import { siteConfig } from "@/lib/site";
import { getIssueBySlug } from "@/lib/content/issues";
import type { MagazineResponse } from "@/types/api";

export const runtime = "nodejs";
export const alt = "Al Riwayat issue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function cleanSummary(value: string): string {
  return value.replace(/\*/g, "").trim();
}

/**
 * Per-issue social preview card. Falls back through local issue content, then
 * the API, then a generic card, so a shared link always renders something
 * on-brand rather than the sitewide default image.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  let title: string = siteConfig.name;
  let summary = "";
  let eyebrow = "Issue";

  const local = getIssueBySlug(params.slug);
  if (local) {
    title = local.title;
    summary = cleanSummary(local.summary ?? "");
    eyebrow = `Issue ${local.issueNumber}`;
  } else {
    try {
      const res = await fetch(
        `${publicEnv.apiUrl}${ENDPOINTS.magazine.byId(params.slug)}`,
        { next: { revalidate: 3600 } },
      );
      if (res.ok) {
        const { data } = (await res.json()) as MagazineResponse;
        title = data.title || title;
        summary = cleanSummary(data.summary ?? "");
        eyebrow = `Issue ${data.issueNumber}`;
      }
    } catch {
      // Fall back to the generic card below.
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1a1614",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "3px", background: "#c2703d" }} />
          <div
            style={{
              color: "#c2703d",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              color: "#f6f1ea",
              fontSize: title.length > 60 ? "62px" : "78px",
              fontWeight: 700,
              lineHeight: 1.08,
              display: "flex",
            }}
          >
            {title.slice(0, 110)}
          </div>
          {summary && (
            <div
              style={{
                color: "#b8ada1",
                fontSize: "30px",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              {summary.slice(0, 130)}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #3a322c",
            paddingTop: "28px",
          }}
        >
          <div style={{ color: "#f6f1ea", fontSize: "26px", display: "flex" }}>
            {siteConfig.tagline}
          </div>
          <div
            style={{
              color: "#8a8078",
              fontSize: "24px",
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            {siteConfig.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
