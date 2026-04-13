"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { subscribeToNewsletter } from "@/services/newsletterService";

export function NewsletterPreviewSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
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
        setMessage("Welcome to the list. Thank you!");
        setEmail("");
      } catch (error: any) {
        const msg =
          error instanceof Error
            ? error.message
            : "Subscription failed. Please try again.";
        setMessage(msg);
        setIsError(true);
      }
    });
  }

  return (
    <section className="rounded-[2.5rem] border border-border bg-primary px-5 py-6 text-primary-foreground shadow-editorial sm:px-8 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            Newsletter
          </p>
          <h2 className="balanced-wrap text-3xl sm:text-4xl text-primary-foreground">
            Stay close to each issue without the noise.
          </h2>
          {/* <p className="max-w-2xl text-sm text-primary-foreground/70 sm:text-base">
            The newsletter section is designed as a low-friction editorial CTA:
            one field, one action, and clear feedback.
          </p> */}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-primary-foreground/15 bg-background/95 p-4 text-foreground shadow-lifted sm:p-5"
        >
          <div className="space-y-3">
            <Label htmlFor="newsletter-email">Email address</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="reader@example.com"
                aria-describedby="newsletter-preview-message"
                className="sm:flex-1"
              />
              <Button
                type="submit"
                className="sm:min-w-[168px]"
                variant="outline"
                disabled={isPending}
              >
                {isPending ? "Joining..." : "Join the List"}
              </Button>
            </div>
            <p
              id="newsletter-preview-message"
              className={`text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`}
            >
              {message ?? "Get each issue summary delivered quietly."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
