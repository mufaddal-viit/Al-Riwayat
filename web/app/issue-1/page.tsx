import type { Metadata } from "next";

import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { ArticleStructuredData } from "@/components/issue/article-structured-data";
import { IssueCoverHero } from "@/components/issue/issue-cover-hero";
import { IssueRichContent } from "@/components/issue/issue-rich-content";
import { IssueShareActions } from "@/components/issue/issue-share-actions";
import { buildMetadata } from "@/lib/metadata";
import { issueOneArticle } from "@/lib/content/issue-content";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: issueOneArticle.title,
    description: issueOneArticle.summary,
    path: `/${issueOneArticle.slug}`,
    image: issueOneArticle.coverImageUrl,
    imageAlt: issueOneArticle.coverImageAlt,
    type: "article",
    publishedTime: issueOneArticle.publishedAt,
    authors: [issueOneArticle.author],
  });
}

export default function IssueOnePage() {
  return (
    <div className="container space-y-8 pb-20 pt-2 sm:pb-10 sm:pt-3 lg:space-y-10 lg:pb-14 lg:pt-4">
      <ArticleStructuredData />
      {/* <IssueCoverHero /> */}
      <IssueRichContent />
      <IssueShareActions />
      <NewsletterPreviewSection />
    </div>
  );
}
