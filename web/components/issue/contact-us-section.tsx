"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRight, CheckCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getReaderIdentity, setReaderIdentity } from "@/lib/reader-identity";
import { submitContactForm } from "@/services/contactService";
import { AppError } from "@/lib/api/error";
import { contactContent as t } from "@/lib/content/contact-content";

const MESSAGE_MAX = 1000;

const TAGS = ["Feedback", "Story idea", "Question", "Other"] as const;
type Tag = (typeof TAGS)[number];

type Fields = { name: string; email: string; message: string };
type FieldErrors = Partial<Fields>;

const underlineInput =
  "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus-visible:outline-none disabled:opacity-60";

const fieldLabel =
  "block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export function ContactUsSection({ className }: { className?: string }) {
  const [topic, setTopic] = useState<Tag>("Feedback");
  const [form, setForm] = useState<Fields>({
    name: "",
    email: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();

  // Prefill from the engagement modal capture, if available.
  useEffect(() => {
    const identity = getReaderIdentity();
    if (identity) {
      setForm((f) => ({
        ...f,
        name: f.name || identity.name,
        email: f.email || identity.email,
      }));
    }
  }, []);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (form.name.trim().length < 2) errs.name = t.validation.nameMin;
    if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = t.validation.emailInvalid;
    if (form.message.trim().length < 20) errs.message = t.validation.messageMin;
    return errs;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot.trim().length > 0) return;

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const taggedMessage = `[${topic.toUpperCase()}]\n\n${form.message.trim()}`;

    startTransition(async () => {
      setStatus("idle");
      setErrorMessage("");
      try {
        await submitContactForm({
          name: trimmedName,
          email: trimmedEmail,
          message: taggedMessage,
          honeypot: "",
        });
        setReaderIdentity({ name: trimmedName, email: trimmedEmail });
        setStatus("success");
        setForm({ name: trimmedName, email: trimmedEmail, message: "" });
        setFieldErrors({});
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof AppError ? err.message : t.fallbackError,
        );
      }
    });
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <section aria-label="Contact" className={cn("w-full", className)}>
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-primary">
            <CheckCircle className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-3xl">{t.success.title}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t.success.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="border-b border-border pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
          >
            {t.success.cta}
          </button>
        </div>
      </section>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <section
      aria-label="Contact"
      className={cn("w-full space-y-12 lg:space-y-16", className)}
    >
      <div
        role="separator"
        aria-label="Contact us"
        className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
      >
        <span aria-hidden className="h-px flex-1 bg-border" />
        Contact us
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 xl:gap-16">
        {/* LEFT — hero */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden className="h-px w-7 bg-primary" />
            Drop a note
          </p>

          <h2 className="font-heading font-extrabold italic leading-[0.95] text-4xl sm:text-5xl lg:text-7xl xl:text-[5rem]">
            Every word
            <br />
            lands somewhere
            <br />
            <em className="text-primary not-italic">real.</em>
          </h2>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Feedback, questions, <em className="text-primary">story ideas</em> —
            every message is read by a real person. No bots, no auto-replies.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {TAGS.map((tag) => {
              const active = topic === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTopic(tag)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-7"
        >
          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <div className="space-y-2">
              <label htmlFor="contact-name" className={fieldLabel}>
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={t.form.namePlaceholder}
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (fieldErrors.name)
                    setFieldErrors((fe) => ({ ...fe, name: undefined }));
                }}
                aria-invalid={!!fieldErrors.name}
                className={cn(
                  underlineInput,
                  fieldErrors.name &&
                    "border-destructive focus:border-destructive",
                )}
              />
              {fieldErrors.name && (
                <p className="text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-email" className={fieldLabel}>
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.form.emailPlaceholder}
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (fieldErrors.email)
                    setFieldErrors((fe) => ({ ...fe, email: undefined }));
                }}
                aria-invalid={!!fieldErrors.email}
                className={cn(
                  underlineInput,
                  fieldErrors.email &&
                    "border-destructive focus:border-destructive",
                )}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          <div className="relative space-y-2 pb-6">
            <label htmlFor="contact-message" className={fieldLabel}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              placeholder={t.form.messagePlaceholder}
              value={form.message}
              onChange={(e) => {
                if (e.target.value.length <= MESSAGE_MAX)
                  setForm((f) => ({ ...f, message: e.target.value }));
                if (fieldErrors.message)
                  setFieldErrors((fe) => ({ ...fe, message: undefined }));
              }}
              aria-invalid={!!fieldErrors.message}
              rows={2}
              className={cn(
                underlineInput,
                "resize-none leading-relaxed",
                fieldErrors.message &&
                  "border-destructive focus:border-destructive",
              )}
            />
            <span
              className={cn(
                "absolute bottom-0 right-0 text-[10px] tabular-nums tracking-wide",
                form.message.length > MESSAGE_MAX * 0.9
                  ? "text-primary"
                  : "text-muted-foreground/70",
              )}
            >
              {form.message.length} / {MESSAGE_MAX}
            </span>
            {fieldErrors.message && (
              <p className="text-xs text-destructive">{fieldErrors.message}</p>
            )}
          </div>

          {status === "error" && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-4 pt-2">
            {/* <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              Never shared.
            </span> */}
            <Button
              type="submit"
              disabled={isPending}
              className="group h-11 gap-2 rounded-md px-6 text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              {isPending ? t.form.submittingLabel : t.form.submitLabel}
              <ArrowRight
                aria-hidden
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
