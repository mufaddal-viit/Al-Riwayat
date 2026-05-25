"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Error</p>
      <h1 className="font-heading text-4xl sm:text-5xl">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred while loading this page. Try again or return home.
      </p>
      <div className="mt-2 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <a href="/">Return home</a>
        </Button>
      </div>
    </div>
  );
}
