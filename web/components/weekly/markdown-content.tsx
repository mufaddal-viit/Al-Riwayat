"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  children: string;
  className?: string;
  /** Adds a drop-cap to the first paragraph (article reading view). */
  dropCap?: boolean;
}

/**
 * Renders Markdown with the site's editorial typography. Raw HTML in the source
 * is NOT rendered (react-markdown ignores it by default), so stored Markdown is
 * safe to display.
 */
export function MarkdownContent({
  children,
  className,
  dropCap = false,
}: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "space-y-5 text-base leading-relaxed text-foreground/90 sm:text-lg sm:leading-[1.85]",
        dropCap &&
          "[&>p:first-of-type::first-letter]:float-left [&>p:first-of-type::first-letter]:mr-3 [&>p:first-of-type::first-letter]:font-heading [&>p:first-of-type::first-letter]:text-[3.5rem] [&>p:first-of-type::first-letter]:font-bold [&>p:first-of-type::first-letter]:leading-[0.8] [&>p:first-of-type::first-letter]:text-primary",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h2
              className="mt-10 font-heading text-2xl leading-tight sm:text-3xl"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="mt-10 font-heading text-2xl leading-tight sm:text-3xl"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="mt-8 font-heading text-xl leading-snug sm:text-2xl"
              {...props}
            />
          ),
          p: ({ ...props }) => <p {...props} />,
          a: ({ ...props }) => (
            <a
              className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul className="ml-5 list-disc space-y-2 marker:text-primary" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="ml-5 list-decimal space-y-2 marker:text-primary" {...props} />
          ),
          li: ({ ...props }) => <li className="pl-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="my-8 border-l-2 border-primary/60 pl-5 font-heading text-xl italic leading-relaxed text-foreground/80 sm:text-2xl"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
          code: ({ ...props }) => (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-10 border-border/60" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
