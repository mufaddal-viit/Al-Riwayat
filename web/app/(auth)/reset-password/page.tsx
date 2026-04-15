"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { resetPassword } from "@/services/authService";
import { AppError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordContent() {
  const searchParams    = useSearchParams();
  const router          = useRouter();
  const token           = searchParams.get("token") ?? "";
  const [isPending, startTransition] = useTransition();

  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass]               = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]         = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!token) {
      setError("Reset link is invalid. Please request a new one.");
      return;
    }

    startTransition(async () => {
      try {
        await resetPassword({ token, newPassword, confirmPassword });
        router.replace("/login?reset=1");
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

  if (!token) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardHeader><CardTitle className="font-heading text-2xl">Invalid link</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This reset link is missing a token. Please request a new one.</p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-2xl">Reset password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {(["newPassword", "confirmPassword"] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>
                {field === "newPassword" ? "New password" : "Confirm password"}
              </Label>
              <div className="relative">
                <Input
                  id={field}
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={field === "newPassword" ? "Min. 8 chars, 1 uppercase, 1 number" : "Repeat password"}
                  value={field === "newPassword" ? newPassword : confirmPassword}
                  onChange={(e) =>
                    field === "newPassword"
                      ? setNewPassword(e.target.value)
                      : setConfirmPassword(e.target.value)
                  }
                  aria-invalid={!!fieldErrors[field]}
                  className={field === "newPassword" ? "pr-11" : ""}
                  required
                />
                {field === "newPassword" && (
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {fieldErrors[field] && (
                <p className="text-xs text-destructive">{fieldErrors[field]}</p>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Set new password"}
          </Button>
          <Link href="/login" className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
