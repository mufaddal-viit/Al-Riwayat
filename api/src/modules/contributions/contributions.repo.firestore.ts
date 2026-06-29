import { Timestamp, FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type {
  ContributionCategory,
  ContributionStatus,
} from "./contributions.types";

/**
 * Contributions are visitor submissions (the `submissions` collection) moving
 * through a moderation lifecycle:
 *
 *   pending  → published   (admin publishes; appears on the public page)
 *            → rejected    (admin soft-hides; kept for record)
 *
 * The raw visitor fields (name, content, assets…) are never destroyed. Admins
 * layer display fields on top (title, editedContent, category override, cover,
 * featured) when publishing.
 */
const COLLECTION = "submissions";

// ─── Stored shape (Firestore) ────────────────────────────────────────────────

const SUBMISSION_TYPE_TO_CATEGORY: Record<string, ContributionCategory> = {
  STORY: "Story",
  POEM: "Poetry",
  ART: "Art",
};

interface StoredAsset {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

interface StoredSubmission {
  name: string;
  age: number | null;
  email: string;
  submissionType: string;
  content: string;
  anonymous: boolean;
  assets?: StoredAsset[];
  status?: ContributionStatus;
  createdAt?: Timestamp;

  // Admin-applied display fields (present once reviewed/published)
  title?: string;
  slug?: string;
  category?: ContributionCategory;
  editedContent?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  featured?: boolean;
  excerpt?: string;
  publishedAt?: Timestamp;
}

// ─── Public-facing contribution shape (matches the frontend `Contribution`) ──

export interface PublicContribution {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: ContributionCategory;
  publishedAt: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featured: boolean;
}

/** Admin view exposes the moderation status + the raw original content. */
export interface AdminContribution extends PublicContribution {
  status: ContributionStatus;
  createdAt: string;
  authorEmail: string;
  anonymous: boolean;
  originalContent: string;
  submissionType: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tsToIso(value: Timestamp | undefined): string {
  return value ? value.toDate().toISOString() : new Date(0).toISOString();
}

function deriveCategory(data: StoredSubmission): ContributionCategory {
  if (data.category) return data.category;
  return SUBMISSION_TYPE_TO_CATEGORY[data.submissionType] ?? "Story";
}

function deriveAuthor(data: StoredSubmission): string {
  return data.anonymous ? "Anonymous" : data.name;
}

function deriveBody(data: StoredSubmission): string {
  return data.editedContent ?? data.content;
}

function deriveExcerpt(data: StoredSubmission): string {
  if (data.excerpt) return data.excerpt;
  const body = deriveBody(data).replace(/\s+/g, " ").trim();
  return body.length > 180 ? `${body.slice(0, 177).trimEnd()}…` : body;
}

function deriveCover(data: StoredSubmission): { url?: string; alt?: string } {
  if (data.coverImageUrl) {
    return {
      url: data.coverImageUrl,
      alt: data.coverImageAlt ?? `Cover image for ${data.title ?? "contribution"}`,
    };
  }
  const firstImage = (data.assets ?? []).find((a) =>
    a.resourceType === "image",
  );
  if (firstImage) {
    return {
      url: firstImage.url,
      alt: data.coverImageAlt ?? `Submitted artwork by ${deriveAuthor(data)}`,
    };
  }
  return {};
}

function toPublic(id: string, data: StoredSubmission): PublicContribution {
  const cover = deriveCover(data);
  return {
    id,
    slug: data.slug ?? slugify(data.title ?? id),
    title: data.title ?? "Untitled contribution",
    author: deriveAuthor(data),
    category: deriveCategory(data),
    publishedAt: tsToIso(data.publishedAt ?? data.createdAt),
    excerpt: deriveExcerpt(data),
    body: deriveBody(data),
    coverImageUrl: cover.url,
    coverImageAlt: cover.alt,
    featured: data.featured ?? false,
  };
}

function toAdmin(id: string, data: StoredSubmission): AdminContribution {
  return {
    ...toPublic(id, data),
    status: data.status ?? "pending",
    createdAt: tsToIso(data.createdAt),
    authorEmail: data.email,
    anonymous: data.anonymous,
    originalContent: data.content,
    submissionType: data.submissionType,
  };
}

// ─── Public reads ─────────────────────────────────────────────────────────────

export async function listPublishedContributions(): Promise<PublicContribution[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("status", "==", "published")
    .get();

  return snap.docs
    .map((d) => toPublic(d.id, d.data() as StoredSubmission))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function findPublishedContributionBySlug(
  slug: string,
): Promise<PublicContribution | null> {
  const db = getAdminDb();
  // Query by slug alone (unique, single-field auto-indexed) and check the
  // status in code. This avoids requiring a composite (status + slug) index,
  // which Firestore would otherwise demand on first call in production.
  const snap = await db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data() as StoredSubmission;
  if (data.status !== "published") return null;
  return toPublic(doc.id, data);
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function listAdminContributions(
  status?: ContributionStatus,
): Promise<AdminContribution[]> {
  const db = getAdminDb();
  // Fetch all and filter in code rather than `where("status","==",...)`.
  // A Firestore equality filter skips documents that LACK the field, so
  // legacy submissions created before the `status` field existed would never
  // appear in the "pending" queue. toAdmin() defaults a missing status to
  // "pending", so filtering on the serialized value surfaces them correctly.
  const snap = await db.collection(COLLECTION).get();

  return snap.docs
    .map((d) => toAdmin(d.id, d.data() as StoredSubmission))
    .filter((item) => !status || item.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findAdminContributionById(
  id: string,
): Promise<AdminContribution | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toAdmin(doc.id, doc.data() as StoredSubmission);
}

// ─── Admin writes ─────────────────────────────────────────────────────────────

async function slugExists(slug: string, exceptId: string): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .get();
  return snap.docs.some((d) => d.id !== exceptId);
}

/** Generate a slug unique within the collection (appends -2, -3, … on clash). */
async function uniqueSlug(base: string, exceptId: string): Promise<string> {
  const seed = slugify(base) || exceptId;
  let candidate = seed;
  let suffix = 2;
  while (await slugExists(candidate, exceptId)) {
    candidate = `${seed}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export interface UpdateContributionFields {
  title?: string;
  category?: ContributionCategory;
  editedContent?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  featured?: boolean;
}

/**
 * Apply admin display edits to a submission. If the title changes, the slug is
 * regenerated (kept unique). Returns null when the doc does not exist.
 */
export async function updateContribution(
  id: string,
  fields: UpdateContributionFields,
): Promise<AdminContribution | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const data = existing.data() as StoredSubmission;
  const patch: Record<string, unknown> = {};

  if (fields.title !== undefined) {
    patch.title = fields.title;
    patch.slug = await uniqueSlug(fields.title, id);
  }
  if (fields.category !== undefined) patch.category = fields.category;
  if (fields.editedContent !== undefined) patch.editedContent = fields.editedContent;
  if (fields.excerpt !== undefined) patch.excerpt = fields.excerpt;
  if (fields.coverImageUrl !== undefined) patch.coverImageUrl = fields.coverImageUrl;
  if (fields.coverImageAlt !== undefined) patch.coverImageAlt = fields.coverImageAlt;
  if (fields.featured !== undefined) patch.featured = fields.featured;

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, { ...data, ...(updated.data() as StoredSubmission) });
}

/**
 * Publish a submission. A title is required (visitors don't provide one), and a
 * unique slug is ensured. Any title/edit fields passed are applied atomically.
 */
export async function publishContribution(
  id: string,
  fields: UpdateContributionFields & { title: string },
): Promise<AdminContribution | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const slug = await uniqueSlug(fields.title, id);

  const patch: Record<string, unknown> = {
    title: fields.title,
    slug,
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
  };
  if (fields.category !== undefined) patch.category = fields.category;
  if (fields.editedContent !== undefined) patch.editedContent = fields.editedContent;
  if (fields.excerpt !== undefined) patch.excerpt = fields.excerpt;
  if (fields.coverImageUrl !== undefined) patch.coverImageUrl = fields.coverImageUrl;
  if (fields.coverImageAlt !== undefined) patch.coverImageAlt = fields.coverImageAlt;
  if (fields.featured !== undefined) patch.featured = fields.featured;

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredSubmission);
}

async function setStatus(
  id: string,
  status: ContributionStatus,
): Promise<AdminContribution | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  await ref.update({ status });
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredSubmission);
}

export function unpublishContribution(id: string) {
  return setStatus(id, "pending");
}

export function rejectContribution(id: string) {
  return setStatus(id, "rejected");
}

export async function deleteContribution(
  id: string,
): Promise<AdminContribution | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const snapshot = toAdmin(existing.id, existing.data() as StoredSubmission);
  await ref.delete();
  return snapshot;
}
