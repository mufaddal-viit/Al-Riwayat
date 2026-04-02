"use client";

import { Copy, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

const articleUrl = `${siteConfig.url}/issue-1`;
const articleText = "Read Issue 1 of Magazine";

export function IssueShareActions() {
  const [copied, setCopied] = useState(false);

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
    <section className="mx-auto flex max-w-[72ch] flex-wrap gap-3">
      <Button asChild variant="outline">
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(articleText)}&url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Twitter/X
        </a>
      </Button>
      <Button asChild variant="outline">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${articleText} ${articleUrl}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </a>
      </Button>
      <Button type="button" variant="outline" onClick={handleCopy}>
        <Copy className="mr-2 h-4 w-4" />
        {copied ? "Copied" : "Copy Link"}
      </Button>
    </section>
  );
}
