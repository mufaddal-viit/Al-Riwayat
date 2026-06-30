"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

import {
  createWeekly,
  updateWeekly,
  type AdminWeekly,
  type WeeklyPayload,
} from "@/services/adminWeeklyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "./markdown-editor";

interface WeeklyEditorProps {
  /** Existing article to edit, or null to create a new one. */
  article: AdminWeekly | null;
  onClose: () => void;
  onSaved: (article: AdminWeekly) => void;
}

function isoToDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function WeeklyEditor({ article, onClose, onSaved }: WeeklyEditorProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("Editorial Desk");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [readingTime, setReadingTime] = useState("3");
  const [weekOf, setWeekOf] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSubtitle(article.subtitle);
      setAuthor(article.author);
      setExcerpt(article.excerpt);
      setBody(article.body);
      setReadingTime(String(article.readingTime));
      setWeekOf(isoToDateInput(article.weekOf));
      setTagsInput(article.tags.join(", "));
    }
  }, [article]);

  async function handleSave() {
    setError(null);
    if (title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (excerpt.trim().length < 20) return setError("Excerpt must be at least 20 characters.");
    if (body.trim().length < 20) return setError("Body must be at least 20 characters.");
    const minutes = Number(readingTime);
    if (!Number.isInteger(minutes) || minutes < 1) {
      return setError("Reading time must be a whole number of minutes.");
    }

    const payload: WeeklyPayload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      author: author.trim() || "Editorial Desk",
      excerpt: excerpt.trim(),
      body: body.trim(),
      readingTime: minutes,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (weekOf) payload.weekOf = weekOf;

    setSaving(true);
    try {
      const saved = article
        ? await updateWeekly(article.id, payload)
        : await createWeekly(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the article.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : article ? "Save changes" : "Create draft"}
          </Button>
        </div>
      </div>

      <h2 className="font-heading text-2xl">
        {article ? "Edit article" : "New Weekly Riwayat"}
      </h2>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="w-title">Title</Label>
            <Input
              id="w-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-subtitle">
              Subtitle{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="w-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A short standfirst / deck"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-excerpt">
              Excerpt{" "}
              <span className="font-normal text-muted-foreground">
                (shown on the listing)
              </span>
            </Label>
            <Textarea
              id="w-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A one or two sentence summary"
              className="min-h-[80px]"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-body">Body</Label>
            <MarkdownEditor id="w-body" value={body} onChange={setBody} disabled={saving} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="w-author">Author</Label>
            <Input
              id="w-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-reading">Reading time (minutes)</Label>
            <Input
              id="w-reading"
              type="number"
              min={1}
              max={120}
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-week">
              Week of{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="w-week"
              type="date"
              value={weekOf}
              onChange={(e) => setWeekOf(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-tags">
              Tags{" "}
              <span className="font-normal text-muted-foreground">
                (comma separated)
              </span>
            </Label>
            <Input
              id="w-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="reflection, ramadan, youth"
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
