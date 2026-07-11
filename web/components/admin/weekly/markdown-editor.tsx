"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Quote,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/weekly/markdown-content";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

type Tool = {
  icon: typeof Bold;
  label: string;
  /** Wrap selection: before + selection + after. */
  wrap?: [string, string];
  /** Prefix each selected line. */
  linePrefix?: string;
  placeholder: string;
};

const TOOLS: Tool[] = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"], placeholder: "bold text" },
  { icon: Italic, label: "Italic", wrap: ["_", "_"], placeholder: "italic text" },
  { icon: Heading2, label: "Heading", linePrefix: "## ", placeholder: "Heading" },
  { icon: Heading3, label: "Subheading", linePrefix: "### ", placeholder: "Subheading" },
  { icon: Quote, label: "Quote", linePrefix: "> ", placeholder: "Quote" },
  { icon: List, label: "Bullet list", linePrefix: "- ", placeholder: "List item" },
  { icon: ListOrdered, label: "Numbered list", linePrefix: "1. ", placeholder: "List item" },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"], placeholder: "link text" },
];

export function MarkdownEditor({
  value,
  onChange,
  disabled = false,
  id,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyTool(tool: Tool) {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);

    let next: string;
    let cursorStart: number;
    let cursorEnd: number;

    if (tool.wrap) {
      const [before, after] = tool.wrap;
      const inner = selected || tool.placeholder;
      next = value.slice(0, start) + before + inner + after + value.slice(end);
      cursorStart = start + before.length;
      cursorEnd = cursorStart + inner.length;
    } else {
      const prefix = tool.linePrefix ?? "";
      // Apply the prefix to the start of each selected line.
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end) || tool.placeholder;
      const prefixed = block
        .split("\n")
        .map((line) => prefix + line)
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(end);
      cursorStart = lineStart;
      cursorEnd = lineStart + prefixed.length;
    }

    onChange(next);
    // Restore selection after React re-renders.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {/* Toolbar — wraps freely so it never sideways-scrolls on a phone */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-1.5 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={() => applyTool(tool)}
              disabled={disabled || mode === "preview"}
              title={tool.label}
              aria-label={tool.label}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
            >
              <tool.icon className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-background/60 p-0.5">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 text-xs font-medium capitalize transition-colors",
                mode === m
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "write" ? (
                <Pencil className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {mode === "write" ? (
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          spellCheck
          placeholder="Write the article in Markdown…"
          className="min-h-[360px] w-full resize-y bg-background px-4 py-3 font-mono text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-60"
        />
      ) : (
        <div className="min-h-[360px] bg-background px-4 py-4">
          {value.trim() ? (
            <MarkdownContent>{value}</MarkdownContent>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
