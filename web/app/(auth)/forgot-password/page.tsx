"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Mail } from "lucide-react";

import { forgotPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
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

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await forgotPassword({ email });
        setSent(true);
      } catch {
        // Generic message regardless of error — prevents email enumeration on the client
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="font-heading text-2xl">Check your inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account with that email exists, we sent a password reset link.
            It expires in <span className="font-medium text-foreground">1 hour</span>.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="text-sm font-medium underline underline-offset-4">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-heading text-2xl">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send a reset link.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <SubmitButton
            icon={Mail}
            label="Send reset link"
            pendingLabel="Sending…"
            isPending={isPending}
          />
          <Link href="/login" className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
