import { siteConfig } from "@/lib/site";
import type { WeeklyArticle } from "@/types/api";

/**
 * Emits schema.org `Article` JSON-LD for a Weekly Riwayat piece so search
 * engines can show it as a rich result (headline, author, dates). Rendered
 * server-side alongside the page metadata.
 */
export function WeeklyStructuredData({ article }: { article: WeeklyArticle }) {
  const url = `${siteConfig.url}/weekly-riwayat/${article.slug}`;
  const published = article.weekOf ?? article.publishedAt ?? undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    ...(published ? { datePublished: published } : {}),
    author: {
      "@type": "Person",
      name: article.author,
    },
    // Matches the route's generated opengraph-image.
    image: [`${url}/opengraph-image`],
    mainEntityOfPage: url,
    url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    ...(article.tags.length > 0 ? { keywords: article.tags.join(", ") } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
