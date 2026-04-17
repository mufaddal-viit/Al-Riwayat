"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { useProtectedRoute } from "@/hooks/useAuth";
import { useProfile } from "@/context/profile-context";
import { AppError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterestPicker } from "@/components/account/interest-picker";
import type { UserProfile } from "@/types/user-profile";

interface FormState {
  displayName: string;
  bio: string;
  occupation: string;
  country: string;
  interests: string[];
  website: string;
  twitter: string;
  linkedin: string;
}

function toFormState(p: UserProfile): FormState {
  return {
    displayName: p.displayName,
    bio: p.bio ?? "",
    occupation: p.occupation ?? "",
    country: p.country ?? "",
    interests: p.interests,
    website: p.socials.website ?? "",
    twitter: p.socials.twitter ?? "",
    linkedin: p.socials.linkedin ?? "",
  };
}

export default function ProfilePage() {
  const { isLoading, user } = useProtectedRoute();
  const { profile, error: profileError, updateProfile } = useProfile();

  const [form, setForm] = useState<FormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Hydrate the form whenever the profile arrives or refreshes — but don't
  // overwrite in-progress edits (skip if the form is already populated).
  useEffect(() => {
    if (profile && form === null) {
      setForm(toFormState(profile));
    }
  }, [profile, form]);

  const loadError = profileError;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSavedAt(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const updated = await updateProfile({
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || null,
          occupation: form.occupation.trim() || null,
          country: form.country.trim() || null,
          interests: form.interests,
          socials: {
            website: form.website.trim(),
            twitter: form.twitter.trim(),
            linkedin: form.linkedin.trim(),
          },
        });
        setForm(toFormState(updated));
        setSavedAt(Date.now());
      } catch (err) {
        if (err instanceof AppError) {
          if (err.errors) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(err.errors)) flat[k] = v[0];
            setFieldErrors(flat);
          } else {
            setSaveError(err.message);
          }
        } else {
          setSaveError("Could not save your profile. Please try again.");
        }
      }
    });
  }

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12 ">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2 px-2">
          <Link href="/account">
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl leading-none">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Tell readers a bit about yourself.
        </p>
      </div>

      <Separator className="bg-border/50" />

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {loadError}
        </p>
      )}

      {form && (
        <form onSubmit={handleSubmit} className="space-y-6 ">
          <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-heading text-xl">About you</CardTitle>
              <CardDescription>
                Your display name and a short bio.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {saveError && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {saveError}
                </p>
              )}
              {savedAt && (
                <p
                  role="status"
                  className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
                >
                  Profile saved.
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) => update("displayName", e.target.value)}
                  aria-invalid={!!fieldErrors.displayName}
                  maxLength={80}
                  required
                />
                {fieldErrors.displayName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.displayName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="A sentence or two about yourself."
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {form.bio.length}/500
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={form.occupation}
                    onChange={(e) => update("occupation", e.target.value)}
                    maxLength={100}
                    placeholder="Writer, student, …"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    maxLength={80}
                    placeholder="India"
                  />
                </div>
              </div>

              <InterestPicker
                value={form.interests}
                onChange={(next) => update("interests", next)}
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-heading text-xl">Socials</CardTitle>
              <CardDescription>
                Optional — full URLs starting with http(s)://
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://example.com"
                  aria-invalid={!!fieldErrors["socials.website"]}
                />
                {fieldErrors["socials.website"] && (
                  <p className="text-xs text-destructive">
                    {fieldErrors["socials.website"]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  type="url"
                  value={form.twitter}
                  onChange={(e) => update("twitter", e.target.value)}
                  placeholder="https://x.com/handle"
                  aria-invalid={!!fieldErrors["socials.twitter"]}
                />
                {fieldErrors["socials.twitter"] && (
                  <p className="text-xs text-destructive">
                    {fieldErrors["socials.twitter"]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => update("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/handle"
                  aria-invalid={!!fieldErrors["socials.linkedin"]}
                />
                {fieldErrors["socials.linkedin"] && (
                  <p className="text-xs text-destructive">
                    {fieldErrors["socials.linkedin"]}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <SubmitButton
                icon={Save}
                label="Save profile"
                pendingLabel="Saving…"
                isPending={isPending}
                className="ml-auto w-auto"
              />
            </CardFooter>
          </Card>
        </form>
      )}
    </main>
  );
}
