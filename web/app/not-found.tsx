import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Page not found",
    description: "The page you were looking for could not be found.",
    path: "/404"
  });
}

export default function NotFound() {
  return (
    <div className="container flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="font-heading text-4xl sm:text-5xl">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you were looking for has moved, been archived, or never existed.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
