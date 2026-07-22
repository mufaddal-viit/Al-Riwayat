import { ImageResponse } from "next/og";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { publicEnv } from "@/lib/public-env";
import { siteConfig } from "@/lib/site";
import type { WeeklyResponse } from "@/types/api";

export const runtime = "nodejs";
export const alt = "Weekly Riwayat article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

/**
 * Per-article social preview card, rendered at request time and cached. Keeps
 * shared links (WhatsApp / Instagram / X) looking editorial instead of showing
 * the same generic site image for every article.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  let title = "Weekly Riwayat";
  let subtitle = "";
  let author = "";
  let date = "";

  try {
    const res = await fetch(
      `${publicEnv.apiUrl}${ENDPOINTS.weekly.byId(params.slug)}`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const { data } = (await res.json()) as WeeklyResponse;
      title = data.title || title;
      subtitle = data.subtitle || data.excerpt || "";
      author = data.author || "";
      date = formatDate(data.weekOf ?? data.publishedAt);
    }
  } catch {
    // Fall back to the generic card below.
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
        {/* Eyebrow */}
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
            Weekly Riwayat
          </div>
        </div>

        {/* Title + standfirst */}
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
          {subtitle && (
            <div
              style={{
                color: "#b8ada1",
                fontSize: "30px",
                lineHeight: 1.35,
                display: "flex",
              }}
            >
              {subtitle.slice(0, 120)}
            </div>
          )}
        </div>

        {/* Byline */}
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
            {[author, date].filter(Boolean).join("  ·  ")}
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
