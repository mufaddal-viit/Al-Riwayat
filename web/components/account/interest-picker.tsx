"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InterestPickerProps {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  disabled?: boolean;
}

export function InterestPicker({
  id = "interests",
  value,
  onChange,
  max = 20,
  disabled,
}: InterestPickerProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim().slice(0, 32);
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Interests</Label>

      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        disabled={disabled || value.length >= max}
        placeholder={
          value.length >= max
            ? `Maximum ${max} interests`
            : "Type and press Enter (e.g. poetry, history)"
        }
      />
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} · max 32 characters each
      </p>
    </div>
  );
}
