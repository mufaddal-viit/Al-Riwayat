"use client";

import { useRef, useState } from "react";
import { ArrowRight, ChevronDown, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { contributeCTA, contributeIntro } from "@/lib/content/contribute";
import { submitContribution } from "@/services/submissionService";

type SubmissionType = "POEM" | "STORY" | "ART";
type AnonymousChoice = "YES" | "NO";
type FormState = "idle" | "submitting" | "success" | "error";

interface FormValues {
  name: string;
  age: string;
  email: string;
  submissionType: SubmissionType | "";
  content: string;
  anonymous: AnonymousChoice | "";
  files: File[];
}

const empty: FormValues = {
  name: "",
  age: "",
  email: "",
  submissionType: "",
  content: "",
  anonymous: "",
  files: [],
};

const MAX_FILES = 5;
const MAX_FILE_MB = 10;

const underlineInput =
  "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus-visible:outline-none disabled:opacity-60";

const fieldLabel =
  "block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

const pillButton =
  "rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50";

const textPanel =
  "w-full resize-y rounded-2xl bg-muted/40 px-4 py-3 text-base leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60";

export function ContributeCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setForm(empty);
    setErrors({});
    setFormState("idle");
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormValues, string>> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.submissionType) e.submissionType = "Select a type.";
    if (!form.content.trim()) e.content = "Your submission cannot be empty.";
    if (!form.anonymous) e.anonymous = "Please select an option.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(
      (f) => f.size <= MAX_FILE_MB * 1024 * 1024,
    );
    setForm((f) => ({
      ...f,
      files: [...f.files, ...valid].slice(0, MAX_FILES),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setFormState("submitting");
    try {
      await submitContribution({
        name: form.name.trim(),
        age: form.age,
        email: form.email.trim(),
        submissionType: form.submissionType as Exclude<
          FormValues["submissionType"],
          ""
        >,
        content: form.content.trim(),
        anonymous: form.anonymous === "YES",
        files: form.files,
      });
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  return (
    <section
      aria-label="Submit your story"
      className="w-full space-y-10 lg:space-y-14"
    >
      {/* Section divider */}
      <div
        role="separator"
        className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
      >
        <span aria-hidden className="h-px flex-1 bg-border" />
        Submit your story
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      {/* CTA banner — borderless, lives in page rhythm */}
      <div className="flex flex-col items-start gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="space-y-5 lg:max-w-2xl">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden className="h-px w-7 bg-primary" />
            Open call
          </p>
          <h2 className="balanced-wrap font-heading font-extrabold italic leading-[0.95] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
            {contributeIntro.title2}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {contributeCTA.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-controls="contribute-form"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground/15 bg-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isOpen ? "Close form" : "Begin submission"}
          <ChevronDown
            aria-hidden
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Animated form panel */}
      <div
        id="contribute-form"
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {formState === "success" ? (
            <div className="flex flex-col items-center gap-4 py-14 text-center">
              <span aria-hidden className="text-3xl text-primary">
                ✦
              </span>
              <p className="font-heading text-2xl sm:text-3xl">
                Submission received.
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                The editorial team will review your work and reach out.
              </p>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setIsOpen(false);
                }}
                className="mt-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-10 pt-2"
            >
              {/* Name + Age + Email */}
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-[1fr_7rem_1.2fr]">
                <div className="space-y-2">
                  <label htmlFor="sub-name" className={fieldLabel}>
                    Name *
                  </label>
                  <input
                    id="sub-name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    disabled={formState === "submitting"}
                    aria-invalid={!!errors.name}
                    className={cn(
                      underlineInput,
                      errors.name &&
                        "border-destructive focus:border-destructive",
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="sub-age" className={fieldLabel}>
                    Age
                  </label>
                  <input
                    id="sub-age"
                    type="number"
                    min={10}
                    max={120}
                    placeholder="22"
                    value={form.age}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, age: e.target.value }))
                    }
                    disabled={formState === "submitting"}
                    className={underlineInput}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="sub-email" className={fieldLabel}>
                    Email *
                  </label>
                  <input
                    id="sub-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    disabled={formState === "submitting"}
                    aria-invalid={!!errors.email}
                    className={cn(
                      underlineInput,
                      errors.email &&
                        "border-destructive focus:border-destructive",
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-3">
                <p className={fieldLabel}>Type of submission *</p>
                <div className="flex flex-wrap gap-2">
                  {(["POEM", "STORY", "ART"] as SubmissionType[]).map(
                    (type) => {
                      const active = form.submissionType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, submissionType: type }))
                          }
                          disabled={formState === "submitting"}
                          aria-pressed={active}
                          className={cn(
                            pillButton,
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                          )}
                        >
                          {type}
                        </button>
                      );
                    },
                  )}
                </div>
                {errors.submissionType && (
                  <p className="text-xs text-destructive">
                    {errors.submissionType}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="sub-content" className={fieldLabel}>
                  Your submission *
                </label>
                <textarea
                  id="sub-content"
                  rows={8}
                  placeholder="Paste or type your work here…"
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  disabled={formState === "submitting"}
                  aria-invalid={!!errors.content}
                  className={cn(
                    textPanel,
                    "min-h-[200px]",
                    errors.content &&
                      "ring-2 ring-destructive/40 focus-visible:ring-destructive/60",
                  )}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content}</p>
                )}
              </div>

              {/* File upload — borderless action */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className={fieldLabel}>Attachments</p>
                  <p className="text-xs text-muted-foreground">
                    Up to {MAX_FILES} files (images or video). Max {MAX_FILE_MB}{" "}
                    MB each.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    form.files.length >= MAX_FILES ||
                    formState === "submitting"
                  }
                  className={cn(
                    "inline-flex items-center gap-2 border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground/50",
                    form.files.length >= MAX_FILES &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  <Upload aria-hidden className="h-3.5 w-3.5" />
                  {form.files.length >= MAX_FILES
                    ? "Maximum reached"
                    : "Add files"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={formState === "submitting"}
                />
                {form.files.length > 0 && (
                  <ul className="space-y-0 pt-2">
                    {form.files.map((file, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-sm"
                      >
                        <span className="truncate text-foreground/80">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              files: f.files.filter((_, j) => j !== i),
                            }))
                          }
                          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Anonymous */}
              <div className="space-y-3">
                <p className={fieldLabel}>Keep submission anonymous? *</p>
                <div className="flex flex-wrap gap-2">
                  {(["YES", "NO"] as AnonymousChoice[]).map((choice) => {
                    const active = form.anonymous === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, anonymous: choice }))
                        }
                        disabled={formState === "submitting"}
                        aria-pressed={active}
                        className={cn(
                          pillButton,
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {errors.anonymous && (
                  <p className="text-xs text-destructive">{errors.anonymous}</p>
                )}
              </div>

              {formState === "error" && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  Something went wrong — please try again.
                </p>
              )}

              <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center sm:gap-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  disabled={formState === "submitting"}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="group h-11 gap-2 rounded-md px-6 text-[11px] font-bold uppercase tracking-[0.14em]"
                >
                  {formState === "submitting" ? "Submitting…" : "Submit"}
                  {formState !== "submitting" && (
                    <ArrowRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
