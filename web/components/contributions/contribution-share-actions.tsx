"use client";

import { Copy, Linkedin, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

const linkClass =
  "h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm";

export function ContributionShareActions({ title }: { title: string }) {
  const shareText = `Read "${title}" on Al-Riwayat`;

  const [url, setUrl] = useState(siteConfig.url);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto max-w-[72ch] space-y-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Share This Piece
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
        <Button asChild variant="outline" className={linkClass}>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
          >
            <Share2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Twitter/X
          </a>
        </Button>
        <Button asChild variant="outline" className={linkClass}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className={linkClass}>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
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
          className={linkClass}
        >
          <Copy className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </div>
    </section>
  );
}
