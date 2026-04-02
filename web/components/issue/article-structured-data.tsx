import { siteConfig } from "@/lib/site";
import { issueOneArticle } from "@/lib/content/issue-content";

export function ArticleStructuredData() {
  const articleImage = new URL(issueOneArticle.coverImageUrl, siteConfig.url).toString();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: issueOneArticle.title,
    description: issueOneArticle.summary,
    datePublished: issueOneArticle.isoPublishedAt,
    author: {
      "@type": "Person",
      name: issueOneArticle.author
    },
    image: [articleImage],
    mainEntityOfPage: `${siteConfig.url}/issue-1`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
