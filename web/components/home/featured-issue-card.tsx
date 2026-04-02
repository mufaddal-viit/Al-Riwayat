import Image from "next/image";
import Link from "next/link";

import { issueOneArticle } from "@/lib/content/issue-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturedIssueCard() {
  return (
    <Card className="overflow-hidden border-none bg-accent text-accent-foreground shadow-editorial">
      <CardContent className="grid gap-5 p-5 sm:grid-cols-[104px_1fr] sm:p-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-border/60 bg-card">
          <Image
            src={issueOneArticle.coverImageUrl}
            alt={issueOneArticle.coverImageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 104px, 120px"
          />
        </div>
        <div className="space-y-4">
          <Badge variant="outline" className="border-accent-foreground/20 bg-card/40">
            Featured Issue
          </Badge>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl leading-tight">
              {issueOneArticle.title}
            </h3>
            <p className="text-sm leading-7 text-accent-foreground/80">
              {issueOneArticle.summary}
            </p>
          </div>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/issue-1">Read Issue 1</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
