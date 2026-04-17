"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/context/profile-context";
import { cn } from "@/lib/utils";

interface ToggleProps {
  slug: string;
}

export function BookmarkFavouriteButtons({ slug }: ToggleProps) {
  const { isAuthenticated } = useAuth();
  const {
    profile,
    isBookmarked,
    isFavourite,
    toggleBookmark,
    toggleFavourite,
  } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <p className="text-xs text-muted-foreground">
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Sign in
        </Link>{" "}
        to bookmark or favourite this issue.
      </p>
    );
  }

  if (!profile) {
    return (
      <div className="flex gap-2.5">
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted sm:h-11" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted sm:h-11" />
      </div>
    );
  }

  const bookmarked = isBookmarked(slug);
  const favourited = isFavourite(slug);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => toggleBookmark(slug))}
          aria-pressed={bookmarked}
          className={cn(
            "h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm",
            bookmarked && "border-primary/60 text-primary",
          )}
        >
          {bookmarked ? (
            <BookmarkCheck className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Bookmark className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => toggleFavourite(slug))}
          aria-pressed={favourited}
          className={cn(
            "h-10 justify-start bg-transparent px-3 text-xs shadow-none sm:h-11 sm:px-4 sm:text-sm",
            favourited && "border-rose-500/60 text-rose-600 dark:text-rose-400",
          )}
        >
          <Heart
            className={cn(
              "mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4",
              favourited && "fill-current",
            )}
          />
          {favourited ? "Favourited" : "Favourite"}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
