import { AppError } from "../../lib/AppError";
import { findPublishedIssueById } from "../magazine/magazine.service";
import * as repo from "./user-profile.repo.firestore";
import type { UpdateMeInput } from "./me.schema";

export const ensureUserDocument = repo.ensureUserDocument;

export async function getMe(uid: string) {
  const profile = await repo.getUserProfile(uid);
  if (!profile) {
    throw new AppError("User profile not found.", 404, "USER_NOT_FOUND");
  }
  return profile;
}

export async function updateMe(uid: string, input: UpdateMeInput) {
  const patch: repo.UpdateUserProfileInput = {};
  if (input.displayName !== undefined) patch.displayName = input.displayName;
  if (input.bio !== undefined) patch.bio = input.bio === "" ? null : input.bio;
  if (input.occupation !== undefined)
    patch.occupation = input.occupation === "" ? null : input.occupation;
  if (input.country !== undefined)
    patch.country = input.country === "" ? null : input.country;
  if (input.interests !== undefined) patch.interests = input.interests;
  if (input.socials !== undefined) {
    patch.socials = {
      ...(input.socials.website && { website: input.socials.website }),
      ...(input.socials.twitter && { twitter: input.socials.twitter }),
      ...(input.socials.linkedin && { linkedin: input.socials.linkedin }),
    };
  }

  return repo.updateUserProfile(uid, patch);
}

async function assertMagazineExists(slug: string): Promise<void> {
  const issue = await findPublishedIssueById(slug);
  if (!issue) {
    throw new AppError(
      `Magazine not found: ${slug}`,
      404,
      "MAGAZINE_NOT_FOUND",
    );
  }
}

export async function addBookmark(uid: string, slug: string) {
  await assertMagazineExists(slug);
  return repo.addBookmark(uid, slug);
}

export async function removeBookmark(uid: string, slug: string) {
  return repo.removeBookmark(uid, slug);
}

export async function addFavourite(uid: string, slug: string) {
  await assertMagazineExists(slug);
  return repo.addFavourite(uid, slug);
}

export async function removeFavourite(uid: string, slug: string) {
  return repo.removeFavourite(uid, slug);
}
