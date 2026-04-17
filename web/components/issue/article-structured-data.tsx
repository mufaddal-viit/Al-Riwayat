import type { Magazine } from "@/types/api";
import { siteConfig } from "@/lib/site";
import { issueOneArticle } from "@/lib/content/issue-content";

export function ArticleStructuredData({ magazine }: { magazine?: Magazine }) {
  const article = magazine || issueOneArticle;
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
