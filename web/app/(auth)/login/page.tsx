"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { AppError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGoogle() {
    setError(null);
    startTransition(async () => {
      try {
        await loginWithGoogle();
        router.replace("/account");
      } catch (err) {
        if (err instanceof AppError) {
          if (err.code === "auth/popup-closed-by-user") return; // user dismissed — silent
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-2xl">Welcome</CardTitle>
        <CardDescription>Sign in to your Al-Riwayat account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={isPending}
          className="w-full justify-center gap-3 py-5 text-base"
        >
          <GoogleLogo className="h-5 w-5" />
          {isPending ? "Signing in…" : "Continue with Google"}
        </Button>
      </CardContent>

      <CardFooter className="pt-2">
        <p className="text-center text-xs text-muted-foreground w-full">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
