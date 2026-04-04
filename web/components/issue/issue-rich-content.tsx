import Link from "next/link";
import { issueOneArticle } from "@/lib/content/issue-content";

export function IssueRichContent() {
  return (
    <section>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/88 shadow-editorial backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="space-y-1">
              {/* <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Flipbook Reader
              </p> */}
              <h2 className="font-heading text-2xl">Read Issue 1 </h2>
            </div>
            <Link
              href={issueOneArticle.flipbookUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Open Full Screen
            </Link>
          </div>
          <div className="h-[72svh] min-h-[540px] w-full bg-background sm:h-[78svh] sm:min-h-[720px] lg:h-[860px] xl:h-[940px]">
            <iframe
              src={issueOneArticle.flipbookUrl}
              title={`${issueOneArticle.title} flipbook`}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
