import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type {
  CreateWeeklyInput,
  UpdateWeeklyInput,
} from "./weekly.schema";
import type { WeeklyStatus } from "./weekly.types";

const COLLECTION = "weekly_riwayat";

// ─── Stored / public shapes ───────────────────────────────────────────────────

interface StoredWeekly {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  excerpt: string;
  body: string;
  readingTime: number;
  weekOf?: string;
  tags?: string[];
  status?: WeeklyStatus;
  publishedAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PublicWeekly {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  excerpt: string;
  body: string;
  readingTime: number;
  weekOf: string | null;
  tags: string[];
  publishedAt: string | null;
}

export interface AdminWeekly extends PublicWeekly {
  status: WeeklyStatus;
  createdAt: string;
  updatedAt: string;
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

function tsToIso(value: Timestamp | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

function toPublic(id: string, data: StoredWeekly): PublicWeekly {
  return {
    id,
    slug: data.slug ?? slugify(data.title ?? id),
    title: data.title ?? "Untitled",
    subtitle: data.subtitle ?? "",
    author: data.author ?? "Editorial Desk",
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    readingTime: data.readingTime ?? 1,
    weekOf: data.weekOf ?? null,
    tags: data.tags ?? [],
    publishedAt: tsToIso(data.publishedAt) ?? tsToIso(data.createdAt),
  };
}

function toAdmin(id: string, data: StoredWeekly): AdminWeekly {
  return {
    ...toPublic(id, data),
    status: data.status ?? "draft",
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: tsToIso(data.updatedAt) ?? new Date(0).toISOString(),
  };
}

async function slugExists(slug: string, exceptId: string): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).where("slug", "==", slug).get();
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

// ─── Public reads ─────────────────────────────────────────────────────────────

export async function listPublishedWeekly(): Promise<PublicWeekly[]> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("status", "==", "published")
    .get();

  return snap.docs
    .map((d) => toPublic(d.id, d.data() as StoredWeekly))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function findPublishedWeeklyBySlug(
  slug: string,
): Promise<PublicWeekly | null> {
  const db = getAdminDb();
  // Query by slug alone (single-field, auto-indexed) and check status in code,
  // avoiding a composite (status + slug) index requirement.
  const snap = await db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  const data = doc.data() as StoredWeekly;
  if (data.status !== "published") return null;
  return toPublic(doc.id, data);
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function listAdminWeekly(
  status?: WeeklyStatus,
): Promise<AdminWeekly[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs
    .map((d) => toAdmin(d.id, d.data() as StoredWeekly))
    .filter((item) => !status || item.status === status)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function findAdminWeeklyById(
  id: string,
): Promise<AdminWeekly | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toAdmin(doc.id, doc.data() as StoredWeekly);
}

// ─── Admin writes ─────────────────────────────────────────────────────────────

export async function createWeekly(
  input: CreateWeeklyInput,
): Promise<AdminWeekly> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();
  const slug = await uniqueSlug(input.slug || input.title, ref.id);

  await ref.set({
    slug,
    title: input.title,
    subtitle: input.subtitle ?? "",
    author: input.author,
    excerpt: input.excerpt,
    body: input.body,
    readingTime: input.readingTime,
    weekOf: input.weekOf ?? null,
    tags: input.tags ?? [],
    status: "draft",
    publishedAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const created = await ref.get();
  return toAdmin(created.id, created.data() as StoredWeekly);
}

export async function updateWeekly(
  id: string,
  input: UpdateWeeklyInput,
): Promise<AdminWeekly | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (input.title !== undefined) patch.title = input.title;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle;
  if (input.author !== undefined) patch.author = input.author;
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
  if (input.body !== undefined) patch.body = input.body;
  if (input.readingTime !== undefined) patch.readingTime = input.readingTime;
  if (input.weekOf !== undefined) patch.weekOf = input.weekOf ?? null;
  if (input.tags !== undefined) patch.tags = input.tags;
  // Slug regenerated when an explicit slug is given, or when the title changes.
  if (input.slug !== undefined) {
    patch.slug = await uniqueSlug(input.slug, id);
  } else if (input.title !== undefined) {
    patch.slug = await uniqueSlug(input.title, id);
  }

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredWeekly);
}

async function setStatus(
  id: string,
  status: WeeklyStatus,
): Promise<AdminWeekly | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const patch: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (status === "published") {
    const data = existing.data() as StoredWeekly;
    // Stamp publishedAt on first publish; keep the original on re-publish.
    if (!data.publishedAt) patch.publishedAt = FieldValue.serverTimestamp();
  }

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredWeekly);
}

export function publishWeekly(id: string) {
  return setStatus(id, "published");
}

export function unpublishWeekly(id: string) {
  return setStatus(id, "draft");
}

export function archiveWeekly(id: string) {
  return setStatus(id, "archived");
}

export async function deleteWeekly(id: string): Promise<AdminWeekly | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const snapshot = toAdmin(existing.id, existing.data() as StoredWeekly);
  await ref.delete();
  return snapshot;
}
