import Link from "next/link";
import type { Magazine } from "@/types/api";
import { issueOneArticle } from "@/lib/content/issue-content";
import { PageReactionBar } from "@/components/issue/page-reaction-bar";

const FLIPBOOK_IFRAME_ID = "issue-flipbook";

interface IssueRichContentProps {
  magazine?: Magazine;
  /** Path on this site that renders this issue — used so bookmarks deep-link back. */
  issuePath?: string;
}

export function IssueRichContent({ magazine, issuePath }: IssueRichContentProps) {
  const article = magazine || issueOneArticle;
  // Default: Issue 1 has its own /issue-1 route; everything else uses /issue/[slug]
  const resolvedIssuePath =
    issuePath ??
    (article.slug === issueOneArticle.slug
      ? `/${article.slug}`
      : `/issue/${article.slug}`);
  return (
    <section>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/88 shadow-editorial backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="space-y-1">
              {/* <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Flipbook Reader
              </p> */}
              <h2 className="font-heading text-2xl">Read {article.title} </h2>
            </div>
            <Link
              href={article.flipbookUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Open Full Screen
            </Link>
          </div>
          <div className="relative h-[72svh] min-h-[540px] w-full bg-background sm:h-[78svh] sm:min-h-[720px] lg:h-[860px] xl:h-[940px]">
            <iframe
              id={FLIPBOOK_IFRAME_ID}
              src={article.flipbookUrl}
              title={`${article.title} flipbook`}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
            />
            <PageReactionBar
              issueSlug={article.slug}
              issueTitle={article.title}
              issuePath={resolvedIssuePath}
              flipbookIframeId={FLIPBOOK_IFRAME_ID}
              flipbookBaseUrl={article.flipbookUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
