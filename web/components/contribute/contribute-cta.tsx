"use client";

import { useRef, useState } from "react";
import { ChevronDown, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <section className="space-y-0">
      {/* CTA banner */}
      <Card className="border-none bg-accent text-accent-foreground">
        <CardContent className="flex flex-col items-center gap-6 px-8 py-10 text-center sm:flex-row sm:text-left">
          <div className="flex-1 space-y-2">
            <h2 className="text-xl sm:text-2xl text-current">
              {contributeIntro.title2}
            </h2>
            <p className="text-sm leading-relaxed opacity-80">
              {contributeCTA.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-current bg-background/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Submit your story
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </CardContent>
      </Card>

      {/* Animated form panel */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            <Card className="bg-card/90">
              {formState === "success" ? (
                <CardContent className="flex flex-col items-center gap-3 px-8 py-14 text-center">
                  <span className="text-3xl">✦</span>
                  <p className="text-xl font-semibold">Submission received.</p>
                  <p className="text-sm text-muted-foreground">
                    The editorial team will review your work and reach out.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      reset();
                      setIsOpen(false);
                    }}
                  >
                    Submit another
                  </Button>
                </CardContent>
              ) : (
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-6"
                  >
                    {/* Name + Age */}
                    <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                      <div className="space-y-1.5">
                        <Label htmlFor="sub-name">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="sub-name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          disabled={formState === "submitting"}
                          className="bg-background/60"
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sub-age">Age</Label>
                        <Input
                          id="sub-age"
                          type="number"
                          min={10}
                          max={120}
                          placeholder="e.g. 22"
                          value={form.age}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, age: e.target.value }))
                          }
                          disabled={formState === "submitting"}
                          className="bg-background/60"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="sub-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sub-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        disabled={formState === "submitting"}
                        className="bg-background/60"
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Submission type */}
                    <div className="space-y-2">
                      <Label>
                        Type of submission{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex flex-wrap gap-3">
                        {(["POEM", "STORY", "ART"] as SubmissionType[]).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({ ...f, submissionType: type }))
                              }
                              disabled={formState === "submitting"}
                              className={cn(
                                "rounded-full border px-5 py-2 text-sm font-semibold tracking-wide transition-all",
                                form.submissionType === type
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-background/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                              )}
                            >
                              {type}
                            </button>
                          ),
                        )}
                      </div>
                      {errors.submissionType && (
                        <p className="text-xs text-destructive">
                          {errors.submissionType}
                        </p>
                      )}
                    </div>

                    {/* Submission content */}
                    <div className="space-y-1.5">
                      <Label htmlFor="sub-content">
                        Your submission{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <textarea
                        id="sub-content"
                        rows={8}
                        placeholder="Paste or type your work here…"
                        value={form.content}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, content: e.target.value }))
                        }
                        disabled={formState === "submitting"}
                        className={cn(
                          "flex w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm leading-relaxed",
                          "placeholder:text-muted-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "min-h-[180px] resize-y",
                        )}
                      />
                      {errors.content && (
                        <p className="text-xs text-destructive">
                          {errors.content}
                        </p>
                      )}
                    </div>

                    {/* File upload */}
                    <div className="space-y-2">
                      <Label>
                        Do you want to submit any pictures related to the
                        submission?
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Upload up to {MAX_FILES} supported files: drawing, image
                        or video. Max {MAX_FILE_MB} MB per file.
                      </p>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-8 transition-colors",
                          "hover:border-foreground/30 hover:bg-muted/30",
                          form.files.length >= MAX_FILES &&
                            "pointer-events-none opacity-50",
                        )}
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {form.files.length >= MAX_FILES
                            ? "Maximum files reached"
                            : "Click to upload files"}
                        </p>
                      </div>
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
                        <ul className="space-y-1.5">
                          {form.files.map((file, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
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
                                className="ml-3 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
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
                    <div className="space-y-2">
                      <Label>
                        Do you want to keep it Anonymous?{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-3">
                        {(["YES", "NO"] as AnonymousChoice[]).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() =>
                              setForm((f) => ({ ...f, anonymous: choice }))
                            }
                            disabled={formState === "submitting"}
                            className={cn(
                              "rounded-full border px-5 py-2 text-sm font-semibold tracking-wide transition-all",
                              form.anonymous === choice
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                            )}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                      {errors.anonymous && (
                        <p className="text-xs text-destructive">
                          {errors.anonymous}
                        </p>
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

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={formState === "submitting"}
                        className="flex-1 sm:flex-none sm:px-8"
                      >
                        {formState === "submitting" ? "Submitting…" : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsOpen(false);
                          reset();
                        }}
                        disabled={formState === "submitting"}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
