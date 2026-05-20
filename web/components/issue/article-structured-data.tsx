import type { Magazine } from "@/types/api";
import type { IssueContent } from "@/lib/content/issues";
import { siteConfig } from "@/lib/site";

interface ArticleStructuredDataProps {
  magazine?: Magazine;
  issue?: IssueContent;
}

export function ArticleStructuredData({
  magazine,
  issue,
}: ArticleStructuredDataProps) {
  const article = issue ?? magazine;
  if (!article) return null;

  const articleImage = new URL(
    article.coverImageUrl,
    siteConfig.url,
  ).toString();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    image: [articleImage],
    mainEntityOfPage: `${siteConfig.url}/issue/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
