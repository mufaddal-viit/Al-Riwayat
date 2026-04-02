"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ContactErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export function ContactFormSection() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors: ContactErrors = {};

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (name.length < 2) {
      nextErrors.name = "Enter a name with at least 2 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (message.length < 20) {
      nextErrors.message = "Write at least 20 characters so the preview feels realistic.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Resolve the highlighted fields to preview the contact flow.");
      return;
    }

    setStatusMessage(
      "Contact form UI is ready. Live submission wiring is added in the next integration phase."
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-none bg-secondary text-secondary-foreground">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground/70">
            Contact
          </p>
          <CardTitle className="text-3xl sm:text-4xl">
            Reach the editorial desk with a clear, lightweight form.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-secondary-foreground/85">
          <p>
            The contact experience is designed to stay short and calm: visible
            labels, helpful spacing, and room for a thoughtful message without
            overwhelming the reader.
          </p>
          <p>
            The hidden honeypot field is already part of the form structure so
            the backend can be connected without changing the UI surface.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle className="text-2xl">Send a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" name="name" placeholder="Your name" />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Tell us what you are reading, thinking, or proposing."
              />
              {errors.message ? (
                <p className="text-sm text-destructive">{errors.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {statusMessage ??
                  "Form validation and accessible field structure are ready in this phase."}
              </p>
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
