import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import {
  type IssueBodyBlock,
  type IssueRichTextSpan,
  issueOneArticle,
} from "@/lib/content/issue-content";

function RichTextInline({ spans }: { spans: readonly IssueRichTextSpan[] }) {
  return (
    <>
      {spans.map((span, index) => {
        let content = (
          <Fragment key={`${span.text}-${index}`}>{span.text}</Fragment>
        );

        if (span.bold) {
          content = <strong key={`${span.text}-${index}`}>{content}</strong>;
        }

        if (span.italic) {
          content = <em key={`${span.text}-${index}`}>{content}</em>;
        }

        return content;
      })}
    </>
  );
}

function renderBlock(block: IssueBodyBlock, index: number) {
  if (block.type === "heading") {
    const HeadingTag = block.level === 2 ? "h2" : "h3";
    return (
      <HeadingTag
        key={`heading-${index}`}
        className={
          block.level === 2 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
        }
      >
        <RichTextInline spans={block.content} />
      </HeadingTag>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p
        key={`paragraph-${index}`}
        className="text-[1.02rem] text-foreground/90"
      >
        <RichTextInline spans={block.content} />
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <figure key={`image-${index}`} className="space-y-3">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-border bg-muted">
          <Image
            src={block.imageUrl}
            alt={block.alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 72ch, 100vw"
          />
        </div>
        {block.caption ? (
          <figcaption className="text-sm text-muted-foreground">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <blockquote
      key={`quote-${index}`}
      className="rounded-[2rem] border border-border bg-secondary/45 px-6 py-5 font-heading text-2xl leading-relaxed text-foreground"
    >
      <p>{block.quote}</p>
      {block.attribution ? (
        <footer className="mt-3 text-sm font-body uppercase tracking-[0.16em] text-muted-foreground">
          {block.attribution}
        </footer>
      ) : null}
    </blockquote>
  );
}

export function IssueRichContent() {
  return (
    <section className="space-y-10">
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

      {/* <article className="mx-auto max-w-[72ch] space-y-8">
        {issueOneArticle.body.map((block, index) => renderBlock(block, index))}
      </article> */}
    </section>
  );
}
