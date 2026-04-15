"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
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

export default function RegisterPage() {
  const { register } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess]     = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        await register(form);
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

  if (success) {
    return (
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="font-heading text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{form.email}</span>.
            Click it to activate your account before signing in.
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
        <CardTitle className="font-heading text-2xl">Create an account</CardTitle>
        <CardDescription>Join Al-Riwayat Magazine</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field}>
                  {field === "firstName" ? "First name" : "Last name"}
                </Label>
                <Input
                  id={field}
                  name={field}
                  autoComplete={field === "firstName" ? "given-name" : "family-name"}
                  placeholder={field === "firstName" ? "Ada" : "Lovelace"}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!fieldErrors.email}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
                aria-invalid={!!fieldErrors.password}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
