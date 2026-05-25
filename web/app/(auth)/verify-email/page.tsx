"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { verifyEmail } from "@/services/authService";
import { AppError } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing or invalid.");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof AppError
            ? err.message
            : "Verification failed. The link may have expired.",
        );
      });
  }, [token]);

  return (
    <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-heading text-2xl">Email verification</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === "loading" && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying your email…
          </div>
        )}

        {status === "success" && (
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm leading-relaxed">
              Your email has been verified. You can now sign in to your account.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm leading-relaxed text-destructive">{message}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-3">
        {status === "success" && (
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
        {status === "error" && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
