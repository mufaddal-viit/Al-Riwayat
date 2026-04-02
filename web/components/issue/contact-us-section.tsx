"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ContactUsErrors = {
  name?: string;
  email?: string;
  message?: string;
};

type ContactUsSectionProps = {
  className?: string;
};

const promptChips = [
  "Contact Us",
  "Feedback",
  "Story Idea",
  "Partnership",
] as const;

export function ContactUsSection({ className }: ContactUsSectionProps) {
  const [errors, setErrors] = useState<ContactUsErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors: ContactUsErrors = {};

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (name.length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (message.length < 20) {
      nextErrors.message =
        "Write at least 20 characters so the note feels clear.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage(
        "Resolve the highlighted fields to preview the contact flow.",
      );
      return;
    }

    setStatusMessage(
      "Contact form UI is ready. Live submission wiring stays in the integration phase.",
    );
  }

  return (
    <section
      aria-labelledby="contact-us-heading"
      className={cn("h-full", className)}
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card/88 shadow-editorial backdrop-blur-xl">
        <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-background/10 to-transparent">
          <div className="flex flex-wrap items-center gap-2">
            {/* <Badge variant="outline" className="bg-card/60">
              Contact Us
            </Badge> */}
            {promptChips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="border-border/50 bg-background/50 text-muted-foreground"
              >
                {chip}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <CardTitle id="contact-us-heading" className="text-3xl sm:text-4xl">
              Bring a note to the editorial desk.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Share feedback, ask a question, or send a story idea through a
              calm, lightweight form designed to feel easy on the page.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issue-contact-name">Name</Label>
                <Input
                  id="issue-contact-name"
                  name="name"
                  placeholder="Your name"
                  className="border-border/70 bg-background/70"
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-contact-email">Email</Label>
                <Input
                  id="issue-contact-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-border/70 bg-background/70"
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email}</p>
                ) : null}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="issue-contact-message">Message</Label>
                <Textarea
                  id="issue-contact-message"
                  name="message"
                  placeholder="Tell us what you are reading, thinking, or proposing."
                  className="min-h-[180px] border-border/70 bg-background/70"
                />
                {errors.message ? (
                  <p className="text-sm text-destructive">{errors.message}</p>
                ) : null}
              </div>
            </div>

            <CardFooter className="mt-auto border-t border-border/70 bg-gradient-to-b from-background/10 to-background/40 p-4 sm:p-6">
              <div className="flex w-full flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-lifted backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:p-5">
                <div className="space-y-2">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {statusMessage ??
                      "Thoughtful notes, collaborations, and reader reflections are all welcome here."}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  variant={"outline"}
                >
                  Send Message
                </Button>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
