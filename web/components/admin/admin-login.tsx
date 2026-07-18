"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminSessionResponse {
  authenticated: boolean;
  email: string | null;
  message?: string;
}

export function AdminLogin({
  onAuthenticated,
}: {
  onAuthenticated: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as AdminSessionResponse;

      if (!response.ok || !data.authenticated || !data.email) {
        setError(data.message ?? "Invalid admin credentials.");
        return;
      }

      onAuthenticated(data.email);
      setPassword("");
    } catch {
      setError("Could not sign in to the admin dashboard.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Restricted access for Al-Riwayat admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-[1.25rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-base"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
