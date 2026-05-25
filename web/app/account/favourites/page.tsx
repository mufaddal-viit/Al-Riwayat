"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProtectedRoute } from "@/hooks/useAuth";
import { SavedIssuesGrid } from "@/components/account/saved-issues-grid";

export default function FavouritesPage() {
  const { isLoading, user } = useProtectedRoute();

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="gap-2 px-2">
        <Link href="/account">
          <ArrowLeft className="h-4 w-4" />
          Back to account
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80">
          <Heart className="h-5 w-5 text-muted-foreground" />
        </span>
        <div>
          <h1 className="font-heading text-2xl leading-none">Favourites</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issues you marked as favourite.
          </p>
        </div>
      </div>

      <Separator className="bg-border/50" />

      <SavedIssuesGrid
        field="favourites"
        emptyTitle="No favourites yet."
        emptyHint="Tap the heart icon on any issue to mark it as a favourite."
      />
    </main>
  );
}
