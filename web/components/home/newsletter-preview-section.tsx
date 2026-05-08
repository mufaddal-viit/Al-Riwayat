"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/services/newsletterService";

const underlineInput =
  "w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus-visible:outline-none disabled:opacity-60";

const fieldLabel =
  "block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

export function NewsletterPreviewSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail);

    if (!isValidEmail) {
      setIsError(true);
      setMessage("Enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        setMessage(null);
        setIsError(false);
        await subscribeToNewsletter(trimmedEmail);
        setIsJoined(true);
        setEmail("");
      } catch (error: unknown) {
        const msg =
          error instanceof Error
            ? error.message
            : "Subscription failed. Please try again.";
        setMessage(msg);
        setIsError(true);
      }
    });
  }

  const helpText = isJoined
    ? "You're on the list."
    : (message ?? "Unsubscribe any time. No tracking.");

  return (
    <section
      aria-label="Newsletter"
      className="w-full space-y-12 lg:space-y-16"
    >
      {/* Section divider */}
      <div
        role="separator"
        aria-label="Newsletter"
        className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
      >
        <span aria-hidden className="h-px flex-1 bg-border" />
        Newsletter
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 xl:gap-16">
        {/* LEFT — hero */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden className="h-px w-7 bg-primary" />
            In your inbox
          </p>

          <h2 className="font-heading font-extrabold italic leading-[0.95] text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem]">
            Stay close
            <br />
            to each <em className="text-primary not-italic">issue.</em>
          </h2>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            No noise. Just the issue summary, a few reads worth your time, and
            nothing else.
          </p>
        </div>

        {/* RIGHT — form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label htmlFor="newsletter-email" className={fieldLabel}>
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (isError) {
                    setIsError(false);
                    setMessage(null);
                  }
                }}
                placeholder="reader@example.com"
                aria-invalid={isError}
                aria-describedby="newsletter-message"
                disabled={isPending || isJoined}
                className={cn(
                  underlineInput,
                  "sm:flex-1",
                  isError && "border-destructive focus:border-destructive",
                )}
              />
              <Button
                type="submit"
                disabled={isPending || isJoined}
                className="group h-11 shrink-0 gap-2 rounded-md px-6 text-[11px] font-bold uppercase tracking-[0.14em]"
              >
                {isJoined ? "Joined" : isPending ? "Joining…" : "Join the list"}
                {!isJoined && (
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Button>
            </div>
          </div>

          <p
            id="newsletter-message"
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isError ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Lock className="h-3 w-3 shrink-0" aria-hidden />
            {helpText}
          </p>
        </form>
      </div>
    </section>
  );
}
