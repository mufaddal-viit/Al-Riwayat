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
    title: "Issue 1",
    description: issueOneArticle.summary,
    path: `/${issueOneArticle.slug}`,
    image: issueOneArticle.coverImageUrl,
  });
}

export default function IssueOnePage() {
  return (
    <div className="container space-y-8 py-8 pb-20 sm:py-10 lg:space-y-10 lg:py-14">
      <ArticleStructuredData />
      {/* <IssueCoverHero /> */}
      <IssueShareActions />
      <IssueRichContent />
      <NewsletterPreviewSection />
    </div>
  );
}
