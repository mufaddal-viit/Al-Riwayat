import Image from "next/image";

import {
  formatIssuePublishedAt,
  issueOneArticle,
} from "@/lib/content/issue-content";
import { Badge } from "@/components/ui/badge";
import type { Magazine } from "@/types/api";

interface IssueCoverHeroProps {
  magazine?: Magazine;
}

export function IssueCoverHero({ magazine }: IssueCoverHeroProps = {}) {
  const coverImageUrl = magazine?.coverImageUrl ?? issueOneArticle.coverImageUrl;
  const coverImageAlt = magazine?.coverImageAlt ?? issueOneArticle.coverImageAlt;
  const issueNumber = magazine?.issueNumber ?? issueOneArticle.issueNumber;
  const title = magazine?.title ?? issueOneArticle.title;
  const summary = magazine?.summary ?? issueOneArticle.summary;
  const publishedAt = magazine?.publishedAt ?? issueOneArticle.publishedAt;
  const author = magazine?.author ?? issueOneArticle.author;

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="relative min-h-[240px] overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-editorial sm:min-h-[360px] sm:rounded-[2.5rem] lg:min-h-[480px]">
        <Image
          src={coverImageUrl}
          alt={coverImageAlt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 1280px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent" />
      </div>

      <div className="mx-auto max-w-[72ch] space-y-4 sm:space-y-5">
        <Badge variant="outline">Issue {issueNumber}</Badge>
        <div className="space-y-2 sm:space-y-3">
          <h1 className="balanced-wrap text-3xl sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground sm:text-sm">
          <span>{formatIssuePublishedAt(publishedAt)}</span>
          <span>{author}</span>
        </div>
      </div>
    </section>
  );
}
