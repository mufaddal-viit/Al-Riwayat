"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import * as profileService from "@/services/profileService";
import { useAuth } from "@/hooks/useAuth";
import type { UpdateProfileInput, UserProfile } from "@/types/user-profile";

interface ProfileContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>;

  isBookmarked: (slug: string) => boolean;
  isFavourite: (slug: string) => boolean;
  toggleBookmark: (slug: string) => Promise<void>;
  toggleFavourite: (slug: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mirror of the latest profile for stable callbacks. Avoids re-creating
  // toggle/refresh on every profile change, which would otherwise force every
  // consumer to re-render and break referential stability.
  const profileRef = useRef<UserProfile | null>(null);
  profileRef.current = profile;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fresh = await profileService.fetchMyProfile();
      setProfile(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Auto-load when auth flips on; clear when it flips off.
  // Deliberately depends only on `isAuthenticated` — including `refresh` would
  // recreate the effect every time auth changes (because refresh closes over
  // isAuthenticated) and could trigger spurious refetches.
  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setProfile(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<UserProfile> => {
      const fresh = await profileService.updateMyProfile(input);
      setProfile(fresh);
      return fresh;
    },
    [],
  );

  const isBookmarked = useCallback(
    (slug: string) => Boolean(profile?.bookmarks.includes(slug)),
    [profile],
  );
  const isFavourite = useCallback(
    (slug: string) => Boolean(profile?.favourites.includes(slug)),
    [profile],
  );

  // `toggle` reads the latest profile via ref instead of closing over it, so
  // its identity is stable across renders. The rollback re-reads the current
  // profile (which may already include other concurrent toggles) and removes
  // *just this slug*, instead of stomping back to a stale snapshot.
  const toggle = useCallback(
    async (
      slug: string,
      field: "bookmarks" | "favourites",
      addCall: (s: string) => Promise<UserProfile>,
      removeCall: (s: string) => Promise<UserProfile>,
    ) => {
      const current = profileRef.current;
      if (!current) return;
      const had = current[field].includes(slug);

      // Optimistic update — derive from the freshest profile.
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: had
            ? prev[field].filter((s) => s !== slug)
            : [...prev[field], slug],
        };
      });

      try {
        const fresh = had ? await removeCall(slug) : await addCall(slug);
        setProfile(fresh);
      } catch (err) {
        // Surgical rollback — invert *only* this toggle, leaving any concurrent
        // toggles intact. Replays the same set-mutation we did optimistically.
        setProfile((prev) => {
          if (!prev) return prev;
          const list = prev[field];
          const isStillToggled = had ? !list.includes(slug) : list.includes(slug);
          if (!isStillToggled) return prev;
          return {
            ...prev,
            [field]: had ? [...list, slug] : list.filter((s) => s !== slug),
          };
        });
        throw err;
      }
    },
    [],
  );

  const toggleBookmark = useCallback(
    (slug: string) =>
      toggle(
        slug,
        "bookmarks",
        profileService.addBookmark,
        profileService.removeBookmark,
      ),
    [toggle],
  );

  const toggleFavourite = useCallback(
    (slug: string) =>
      toggle(
        slug,
        "favourites",
        profileService.addFavourite,
        profileService.removeFavourite,
      ),
    [toggle],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isLoading,
      error,
      refresh,
      updateProfile,
      isBookmarked,
      isFavourite,
      toggleBookmark,
      toggleFavourite,
    }),
    [
      profile,
      isLoading,
      error,
      refresh,
      updateProfile,
      isBookmarked,
      isFavourite,
      toggleBookmark,
      toggleFavourite,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used inside <ProfileProvider>");
  }
  return ctx;
}
