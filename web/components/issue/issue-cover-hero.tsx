import Image from "next/image";

import { formatIssuePublishedAt, type IssueContent } from "@/lib/content/issues";
import { Badge } from "@/components/ui/badge";
import type { Magazine } from "@/types/api";

interface IssueCoverHeroProps {
  magazine: Magazine | IssueContent;
}

function cleanSummary(summary: string) {
  return summary.replace(/\*/g, "");
}

export function IssueCoverHero({ magazine }: IssueCoverHeroProps) {
  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-editorial sm:min-h-[520px] sm:rounded-[2.5rem] lg:min-h-[640px]">
        <Image
          src={magazine.coverImageUrl}
          alt=""
          fill
          priority
          aria-hidden
          className="scale-105 object-cover opacity-20"
          sizes="(min-width: 1024px) 1280px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/45 to-background/70" />
        <Image
          src={magazine.coverImageUrl}
          alt={magazine.coverImageAlt}
          fill
          priority
          className="object-contain p-4 sm:p-6 lg:p-8"
          sizes="(min-width: 1024px) 720px, 100vw"
        />
      </div>

      <div className="mx-auto max-w-[72ch] space-y-4 sm:space-y-5">
        <Badge variant="outline">Issue {magazine.issueNumber}</Badge>
        <div className="space-y-2 sm:space-y-3">
          <h1 className="balanced-wrap text-3xl sm:text-4xl lg:text-5xl">
            {magazine.title}
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            {cleanSummary(magazine.summary)}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground sm:text-sm">
          <span>{formatIssuePublishedAt(magazine.publishedAt)}</span>
          <span>{magazine.author}</span>
        </div>
      </div>
    </section>
  );
}
