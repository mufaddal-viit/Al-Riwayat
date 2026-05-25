import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

const COLLECTION = "users";

interface StoredUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string | null;
  occupation: string | null;
  country: string | null;
  interests: string[];
  socials: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  bookmarks: string[];
  favourites: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string | null;
  occupation: string | null;
  country: string | null;
  interests: string[];
  socials: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  bookmarks: string[];
  favourites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EnsureUserInput {
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  bio?: string | null;
  occupation?: string | null;
  country?: string | null;
  interests?: string[];
  socials?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
}

function toPublic(data: StoredUserProfile): UserProfile {
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoUrl: data.photoUrl,
    bio: data.bio,
    occupation: data.occupation,
    country: data.country,
    interests: data.interests ?? [],
    socials: data.socials ?? {},
    bookmarks: data.bookmarks ?? [],
    favourites: data.favourites ?? [],
    createdAt: data.createdAt.toDate().toISOString(),
    updatedAt: data.updatedAt.toDate().toISOString(),
  };
}

/**
 * Idempotent upsert. Sets identity fields + defaults only if the doc is new;
 * repeat logins merge without clobbering user-edited fields.
 */
export async function ensureUserDocument(
  input: EnsureUserInput,
): Promise<UserProfile> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(input.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    const now = FieldValue.serverTimestamp();
    await ref.set({
      uid: input.uid,
      email: input.email,
      displayName: input.displayName,
      photoUrl: input.photoUrl,
      bio: null,
      occupation: null,
      country: null,
      interests: [],
      socials: {},
      bookmarks: [],
      favourites: [],
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Refresh identity fields that come from the IdP, leave user-editable
    // fields untouched.
    await ref.set(
      {
        email: input.email,
        photoUrl: input.photoUrl,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  const fresh = await ref.get();
  return toPublic(fresh.data() as StoredUserProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return toPublic(snap.data() as StoredUserProfile);
}

export async function updateUserProfile(
  uid: string,
  patch: UpdateUserProfileInput,
): Promise<UserProfile> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(uid);

  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (patch.displayName !== undefined) update.displayName = patch.displayName;
  if (patch.bio !== undefined) update.bio = patch.bio;
  if (patch.occupation !== undefined) update.occupation = patch.occupation;
  if (patch.country !== undefined) update.country = patch.country;
  if (patch.interests !== undefined) update.interests = patch.interests;
  if (patch.socials !== undefined) update.socials = patch.socials;

  await ref.set(update, { merge: true });
  const fresh = await ref.get();
  return toPublic(fresh.data() as StoredUserProfile);
}

type CollectionField = "bookmarks" | "favourites";

async function mutateCollection(
  uid: string,
  field: CollectionField,
  op: "add" | "remove",
  slug: string,
): Promise<UserProfile> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(uid);
  await ref.set(
    {
      [field]:
        op === "add" ? FieldValue.arrayUnion(slug) : FieldValue.arrayRemove(slug),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  const fresh = await ref.get();
  return toPublic(fresh.data() as StoredUserProfile);
}

export function addBookmark(uid: string, slug: string) {
  return mutateCollection(uid, "bookmarks", "add", slug);
}
export function removeBookmark(uid: string, slug: string) {
  return mutateCollection(uid, "bookmarks", "remove", slug);
}
export function addFavourite(uid: string, slug: string) {
  return mutateCollection(uid, "favourites", "add", slug);
}
export function removeFavourite(uid: string, slug: string) {
  return mutateCollection(uid, "favourites", "remove", slug);
}
