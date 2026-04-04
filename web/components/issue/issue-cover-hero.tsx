import Image from "next/image";

import {
  formatIssuePublishedAt,
  issueOneArticle,
} from "@/lib/content/issue-content";
import { Badge } from "@/components/ui/badge";

export function IssueCoverHero() {
  return (
    <section className="space-y-8">
      <div className="relative min-h-[360px] overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-editorial sm:min-h-[480px]">
        <Image
          src={issueOneArticle.coverImageUrl}
          alt={issueOneArticle.coverImageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent" />
      </div>

      <div className="mx-auto max-w-[72ch] space-y-5">
        <Badge variant="outline">Issue {issueOneArticle.issueNumber}</Badge>
        <div className="space-y-3">
          <h1 className="balanced-wrap text-4xl sm:text-5xl">
            {issueOneArticle.title}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {issueOneArticle.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
          <span>{formatIssuePublishedAt(issueOneArticle.publishedAt)}</span>
          <span>{issueOneArticle.author}</span>
        </div>
      </div>
    </section>
  );
}
