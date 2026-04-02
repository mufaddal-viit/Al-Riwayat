"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function IssueNewsletterCta() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail);

    if (!isValidEmail) {
      setIsError(true);
      setMessage("Use a valid email address to preview the issue signup flow.");
      return;
    }

    setIsError(false);
    setMessage(
      "This CTA is ready for backend wiring. Live newsletter submission arrives in the next phase."
    );
  }

  return (
    <section className="mx-auto max-w-[72ch] rounded-[2.25rem] border border-border bg-primary px-5 py-6 text-primary-foreground shadow-editorial sm:px-8 sm:py-8">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            Newsletter
          </p>
          <h2 className="text-3xl sm:text-4xl">
            Continue with the next issue when it arrives.
          </h2>
          <p className="text-sm text-primary-foreground/80 sm:text-base">
            The article page closes with a single, calm CTA that keeps the
            editorial flow intact.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="issue-newsletter-email" className="text-primary-foreground">
            Email address
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="issue-newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="reader@example.com"
              className="border-primary-foreground/15 bg-background/95 text-foreground"
            />
            <Button type="submit" variant="secondary" className="sm:min-w-[180px]">
              Subscribe
            </Button>
          </div>
          <p className={`text-sm ${isError ? "text-destructive-foreground" : "text-primary-foreground/75"}`}>
            {message ??
              "Designed for low-friction signup with concise feedback and large tap targets."}
          </p>
        </form>
      </div>
    </section>
  );
}
