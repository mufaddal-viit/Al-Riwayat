import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";

import type { IssueContent } from "@/lib/content/issues";
import { formatIssuePublishedAt } from "@/lib/content/issues";

interface IssueComingSoonProps {
  issue: IssueContent;
}

export function IssueComingSoon({ issue }: IssueComingSoonProps) {
  const launch = formatIssuePublishedAt(issue.publishedAt);

  return (
    <section className="relative overflow-hidden">
      {/* Ombre wash — same vocabulary as the about page so the brand stays consistent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_80%_at_100%_50%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_50%_60%_at_5%_30%,color-mix(in_oklab,var(--accent)_15%,transparent),transparent_70%)]"
      />

      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center gap-8 px-6 py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Issue {issue.issueNumber} — Coming Soon
        </span>

        <h1 className="balanced-wrap font-heading text-4xl leading-[1.05] sm:text-5xl lg:text-7xl xl:text-8xl">
          {issue.title}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
          {issue.summary}
        </p>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Launching
          </span>
          <span className="font-heading text-2xl sm:text-3xl">{launch}</span>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lifted transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Bell className="h-4 w-4" aria-hidden />
            Notify me when it drops
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
