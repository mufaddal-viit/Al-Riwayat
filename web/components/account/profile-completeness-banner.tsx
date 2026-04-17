"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/types/user-profile";

const DISMISS_KEY = "profile-completeness-dismissed";

interface ProfileCompletenessBannerProps {
  profile: UserProfile | null;
  onDismiss: () => void;
  dismissed: boolean;
}

export function isProfileIncomplete(p: UserProfile | null): boolean {
  if (!p) return false;
  return !p.bio || !p.occupation || p.interests.length === 0;
}

export function ProfileCompletenessBanner({
  profile,
  onDismiss,
  dismissed,
}: ProfileCompletenessBannerProps) {
  if (!profile || dismissed || !isProfileIncomplete(profile)) return null;

  const missing: string[] = [];
  if (!profile.bio) missing.push("bio");
  if (!profile.occupation) missing.push("occupation");
  if (profile.interests.length === 0) missing.push("interests");

  return (
    <div className="relative rounded-2xl border border-primary/30 bg-primary/5 p-4 pr-10 shadow-editorial">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="space-y-2">
          <div>
            <p className="font-medium">Complete your profile</p>
            <p className="text-sm text-muted-foreground">
              Add your {missing.join(", ")} so we can tailor your reading experience.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/account/profile">Edit profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DISMISS_KEY as PROFILE_COMPLETENESS_DISMISS_KEY };
