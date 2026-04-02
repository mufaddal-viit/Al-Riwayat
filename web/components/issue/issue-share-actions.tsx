"use client";

import { Copy, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

const fallbackArticleUrl = `${siteConfig.url}/issue-1`;
const articleText = "Read Issue 1 of Al Riwayaat";

export function IssueShareActions() {
  const [articleUrl, setArticleUrl] = useState(fallbackArticleUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setArticleUrl(window.location.href);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto max-w-[72ch] space-y-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Share This Issue
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
        <Button
          asChild
          variant="outline"
          className="h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm"
        >
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(articleText)}&url=${encodeURIComponent(articleUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Share2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Twitter/X
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm"
        >
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${articleText} ${articleUrl}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            WhatsApp
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm"
        >
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            LinkedIn
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm"
        >
          <Copy className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </section>
  );
}
