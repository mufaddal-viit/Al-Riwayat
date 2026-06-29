"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyableEmailProps {
  email: string;
  className?: string;
}

/** Email with a one-click copy button and copied confirmation. */
export function CopyableEmail({ email, className }: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!email) return <span className="text-muted-foreground">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 py-1 pl-2.5 pr-1.5 text-xs",
        className,
      )}
    >
      <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
      <a
        href={`mailto:${email}`}
        className="max-w-[200px] truncate text-foreground hover:underline"
        title={email}
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy email"}
        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        {copied ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}
