"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Eye, EyeOff, Heart, LogOut, Pencil, Trash2, User } from "lucide-react";

import { useAuth, useProtectedRoute } from "@/hooks/useAuth";
import { useProfile } from "@/context/profile-context";
import { updateProfile, changePassword, deleteAccount } from "@/services/authService";
import { AppError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PROFILE_COMPLETENESS_DISMISS_KEY,
  ProfileCompletenessBanner,
} from "@/components/account/profile-completeness-banner";

// ─── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      try {
        await updateProfile(form);
        await refreshUser();
        setSuccess(true);
      } catch (err) {
        if (err instanceof AppError) {
          if (err.errors) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(err.errors)) flat[k] = v[0];
            setFieldErrors(flat);
          } else {
            setError(err.message);
          }
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-xl">Profile</CardTitle>
        <CardDescription>Update your name and display information.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Profile updated successfully.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={`profile-${field}`}>
                  {field === "firstName" ? "First name" : "Last name"}
                </Label>
                <Input
                  id={`profile-${field}`}
                  name={field}
                  autoComplete={field === "firstName" ? "given-name" : "family-name"}
                  value={form[field]}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors[field]}
                  required
                />
                {fieldErrors[field] && (
                  <p className="text-xs text-destructive">{fieldErrors[field]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ─── Change Password Section ───────────────────────────────────────────────────

function ChangePasswordSection() {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      try {
        await changePassword(form);
        setSuccess(true);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (err) {
        if (err instanceof AppError) {
          if (err.errors) {
            const flat: Record<string, string> = {};
            for (const [k, v] of Object.entries(err.errors)) flat[k] = v[0];
            setFieldErrors(flat);
          } else {
            setError(err.message);
          }
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-xl">Password</CardTitle>
        <CardDescription>Change your account password.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Password changed successfully.
            </p>
          )}

          {/* Current password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.currentPassword}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-xs text-destructive">{fieldErrors.currentPassword}</p>
            )}
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.newPassword}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.newPassword}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.confirmPassword}
              required
            />
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ─── Danger Zone Section ───────────────────────────────────────────────────────

function DangerZoneSection() {
  const { logout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startTransition(async () => {
      try {
        await deleteAccount();
        await logout();
      } catch {
        setError("Could not delete account. Please try again.");
        setConfirmDelete(false);
      }
    });
  }

  return (
    <Card className="border-destructive/40 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-xl text-destructive">Danger zone</CardTitle>
        <CardDescription>Irreversible account actions.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {confirmDelete && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This will permanently delete your account and all associated data.
            Click <strong>Delete account</strong> again to confirm.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 p-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground">
              Permanently remove your account and all data.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="border-destructive/60 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? "Deleting…" : confirmDelete ? "Delete account" : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { isLoading, user } = useProtectedRoute();
  const { logout } = useAuth();
  const { profile } = useProfile();

  const [bannerDismissed, setBannerDismissed] = useState(true); // assume dismissed until storage read

  useEffect(() => {
    setBannerDismissed(
      typeof window !== "undefined" &&
        window.localStorage.getItem(PROFILE_COMPLETENESS_DISMISS_KEY) === "1",
    );
  }, []);

  function dismissBanner() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFILE_COMPLETENESS_DISMISS_KEY, "1");
    }
    setBannerDismissed(true);
  }

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80">
            <User className="h-5 w-5 text-muted-foreground" />
          </span>
          <div>
            <h1 className="font-heading text-2xl leading-none">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      <Separator className="bg-border/50" />

      <ProfileCompletenessBanner
        profile={profile}
        onDismiss={dismissBanner}
        dismissed={bannerDismissed}
      />

      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="font-heading text-xl">Account details</CardTitle>
            <CardDescription>Managed by your Google account.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/account/profile">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Name</span>
            <span>{profile?.displayName ?? `${user.firstName} ${user.lastName}`}</span>
          </div>
          <div className="flex justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          {profile?.occupation && (
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Occupation</span>
              <span>{profile.occupation}</span>
            </div>
          )}
          {profile?.country && (
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Country</span>
              <span>{profile.country}</span>
            </div>
          )}
          {profile && profile.interests.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground">Interests</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile?.bio && (
            <div className="pt-2 text-muted-foreground">
              <p className="text-xs uppercase tracking-wider">Bio</p>
              <p className="mt-1 text-sm text-foreground">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/bookmarks"
          className="group block focus-visible:outline-none"
        >
          <Card className="border-border/60 bg-card/80 shadow-editorial transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary/60">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                <Bookmark className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium">Bookmarks</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.bookmarks.length ?? 0} saved
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/account/favourites"
          className="group block focus-visible:outline-none"
        >
          <Card className="border-border/60 bg-card/80 shadow-editorial transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary/60">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                <Heart className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium">Favourites</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.favourites.length ?? 0} marked
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Suppress unused-warnings for the preserved DB-dependent sections. */}
      {false && (
        <>
          <ProfileSection />
          <ChangePasswordSection />
          <DangerZoneSection />
        </>
      )}
    </main>
  );
}
