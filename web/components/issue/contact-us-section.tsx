"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { submitContactForm } from "@/services/contactService";
import { AppError } from "@/lib/api/error";
import { contactContent as t } from "@/lib/content/contact-content";

// ─── Constants ────────────────────────────────────────────────────────────────

const MESSAGE_MAX = 2000;

// ─── Types ────────────────────────────────────────────────────────────────────

type Fields = { name: string; email: string; message: string };
type FieldErrors = Partial<Fields>;

// ─── Component ────────────────────────────────────────────────────────────────

export function ContactUsSection({ className }: { className?: string }) {
  const { isAuthenticated, user } = useAuth();

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

  const resolvedName = isAuthenticated
    ? `${user!.firstName} ${user!.lastName}`
    : form.name;
  const resolvedEmail = isAuthenticated ? user!.email : form.email;

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!isAuthenticated && resolvedName.trim().length < 2)
      errs.name = t.validation.nameMin;
    if (!isAuthenticated && !/\S+@\S+\.\S+/.test(resolvedEmail))
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

    startTransition(async () => {
      setStatus("idle");
      setErrorMessage("");
      try {
        await submitContactForm({
          name: resolvedName.trim(),
          email: resolvedEmail.trim(),
          message: form.message.trim(),
          honeypot: "",
        });
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        setFieldErrors({});
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof AppError ? err.message : t.fallbackError,
        );
      }
    });
  }

  // ── Success state ────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <Card
        className={cn(
          "flex h-full flex-col items-center justify-center gap-5 border-border p-10 text-center shadow-none",
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-secondary/45">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-heading text-2xl tracking-tight">
            {t.success.title}
          </h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t.success.description}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          {t.success.cta}
        </Button>
      </Card>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────

  return (
    <Card className={cn("flex h-full flex-col border-border shadow-none", className)}>
      <CardHeader className="space-y-3">
        <Badge variant="outline" className="w-fit">
          {t.badge}
        </Badge>
          <div className="space-y-1.5">
            <CardTitle id="contact-us-heading" className="text-2xl sm:text-3xl">
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto" />

        <CardContent className="flex-1 pt-6">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex h-full flex-col gap-5"
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

            {/* Sender identity */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 rounded-[1.75rem] border border-border/70 bg-background/76 p-3 shadow-lifted backdrop-blur">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs font-semibold">
                    {user!.firstName[0]}
                    {user!.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground border-none">
                    {user!.firstName} {user!.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground border-none">
                    {user!.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    name="name"
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
                      "border-none",
                      fieldErrors.name &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
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
                      "border-none",
                      fieldErrors.email &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Message */}
            <div className="flex flex-1 flex-col space-y-2 ">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="contact-message">Message</Label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    form.message.length > MESSAGE_MAX * 0.9
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {form.message.length}/{MESSAGE_MAX}
                </span>
              </div>
              <Textarea
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
                rows={5}
                className={cn(
                  "flex-1 resize-none border-none outline-none focus:ring-0 focus:outline-none",
                  fieldErrors.message &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {fieldErrors.message && (
                <p className="text-xs text-destructive">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            {/* Error banner */}
            {status === "error" && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            {/* Submit */}
            <SubmitButton
              icon={Send}
              label={t.form.submitLabel}
              pendingLabel={t.form.submittingLabel}
              isPending={isPending}
            />
          </form>
        </CardContent>
    </Card>
  );
}
