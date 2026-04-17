"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  useEffect(() => {
    if (isAuthenticated) {
      void refresh();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [isAuthenticated, refresh]);

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

  const toggle = useCallback(
    async (
      slug: string,
      field: "bookmarks" | "favourites",
      addCall: (s: string) => Promise<UserProfile>,
      removeCall: (s: string) => Promise<UserProfile>,
    ) => {
      if (!profile) return;
      const has = profile[field].includes(slug);

      // Optimistic update
      const next: UserProfile = {
        ...profile,
        [field]: has
          ? profile[field].filter((s) => s !== slug)
          : [...profile[field], slug],
      };
      setProfile(next);

      try {
        const fresh = has ? await removeCall(slug) : await addCall(slug);
        setProfile(fresh);
      } catch (err) {
        setProfile(profile); // rollback
        throw err;
      }
    },
    [profile],
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
