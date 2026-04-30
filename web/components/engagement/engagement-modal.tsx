"use client";

import { useEffect, useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "al_riwayat_engagement_shown";
const TRIGGER_SCROLL_DEPTH = 0.5;  // 50% of page
const TRIGGER_TIME_MS = 60_000;    // 60 seconds

type FormState = "idle" | "submitting" | "success" | "error";

interface FormValues {
  name: string;
  email: string;
  age: string;
  occupation: string;
  subscribe: boolean;
}

const empty: FormValues = {
  name: "",
  email: "",
  age: "",
  occupation: "",
  subscribe: true,
};

export function EngagementModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [formState, setFormState] = useState<FormState>("idle");
  const [ageError, setAgeError] = useState<string | null>(null);
  const triggered = useRef(false);

  // Trigger on time or scroll — only once per browser
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    function trigger() {
      if (triggered.current) return;
      triggered.current = true;
      setOpen(true);
    }

    // Time trigger
    const timer = setTimeout(trigger, TRIGGER_TIME_MS);

    // Scroll trigger
    function onScroll() {
      const scrolled =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= TRIGGER_SCROLL_DEPTH) trigger();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleOpenChange(next: boolean) {
    // On any close (X or overlay click), mark as shown so it never re-appears
    if (!next) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(next);
  }

  function validateAge(raw: string): boolean {
    const n = Number(raw);
    if (!raw || isNaN(n) || n < 13 || n > 120) {
      setAgeError("Enter a valid age (13 – 120).");
      return false;
    }
    setAgeError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAge(form.age)) return;

    setFormState("submitting");
    try {
      await addDoc(collection(db, "engagement_submissions"), {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        age: Number(form.age),
        occupation: form.occupation.trim(),
        subscribeToEmails: form.subscribe,
        submittedAt: serverTimestamp(),
      });
      setFormState("success");
      setTimeout(() => handleOpenChange(false), 1800);
    } catch {
      setFormState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "border border-border/50 bg-card/95 shadow-editorial backdrop-blur-xl",
          "rounded-2xl p-0 overflow-hidden",
        )}
      >
        {formState === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 px-8 py-14 text-center">
            <span className="text-3xl">✦</span>
            <p className="font-heading text-xl font-semibold">Thank you!</p>
            <p className="text-sm text-muted-foreground">
              We're glad to have you with us.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Decorative top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-foreground/20 via-foreground/60 to-foreground/20" />

            <div className="px-7 pb-8 pt-7">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl">A moment of your time</DialogTitle>
                <DialogDescription className="mt-1.5 text-sm leading-relaxed">
                  Help us understand our readers — it takes under a minute.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="eng-name">Name</Label>
                  <Input
                    id="eng-name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    disabled={formState === "submitting"}
                    className="bg-background/60"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="eng-email">Email</Label>
                  <Input
                    id="eng-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    disabled={formState === "submitting"}
                    className="bg-background/60"
                  />
                </div>

                {/* Age + Occupation side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="eng-age">Age</Label>
                    <Input
                      id="eng-age"
                      type="number"
                      min={13}
                      max={120}
                      placeholder="e.g. 28"
                      value={form.age}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, age: e.target.value }));
                        if (ageError) validateAge(e.target.value);
                      }}
                      required
                      disabled={formState === "submitting"}
                      className="bg-background/60"
                    />
                    {ageError && (
                      <p className="text-xs text-destructive">{ageError}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="eng-occupation">Occupation</Label>
                    <Input
                      id="eng-occupation"
                      placeholder="e.g. Designer"
                      value={form.occupation}
                      onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
                      required
                      disabled={formState === "submitting"}
                      className="bg-background/60"
                    />
                  </div>
                </div>

                {/* Subscribe checkbox */}
                <div className="flex items-start gap-3 pt-1">
                  <Checkbox
                    id="eng-subscribe"
                    checked={form.subscribe}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({ ...f, subscribe: Boolean(checked) }))
                    }
                    disabled={formState === "submitting"}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="eng-subscribe" className="cursor-pointer font-normal">
                      Send me new issues and updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your data is stored securely and never shared.
                    </p>
                  </div>
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
                    className="flex-1"
                  >
                    {formState === "submitting" ? "Submitting…" : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    disabled={formState === "submitting"}
                    className="text-muted-foreground"
                  >
                    Maybe later
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
