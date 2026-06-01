import {
  Timestamp,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface AdminDashboardMetric {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export interface AdminFirestoreDocument {
  id: string;
  path: string;
  data: Record<string, JsonValue>;
  fields: string[];
  primaryDate: string | null;
}

export interface AdminFirestoreCollection {
  id: string;
  label: string;
  path: string;
  total: number;
  latestAt: string | null;
  fields: string[];
  documents: AdminFirestoreDocument[];
}

export interface AdminDashboardData {
  generatedAt: string;
  metrics: AdminDashboardMetric[];
  collections: AdminFirestoreCollection[];
}

const COLLECTION_LABELS: Record<string, string> = {
  comments: "Comments",
  contacts: "Contact messages",
  engagement_submissions: "Engagement submissions",
  newsletter: "Newsletter subscribers",
  page_reactions: "Page reactions",
  submissions: "Contributions",
  users: "User profiles",
};

const COLLECTION_ORDER = [
  "users",
  "comments",
  "contacts",
  "newsletter",
  "submissions",
  "engagement_submissions",
  "page_reactions",
];

const DATE_FIELDS = [
  "createdAt",
  "updatedAt",
  "submittedAt",
  "subscribedAt",
  "publishedAt",
];

function humanizeCollectionId(id: string): string {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function collectionLabel(id: string): string {
  return COLLECTION_LABELS[id] ?? humanizeCollectionId(id);
}

function orderCollections(
  a: AdminFirestoreCollection,
  b: AdminFirestoreCollection,
): number {
  const indexA = COLLECTION_ORDER.indexOf(a.id);
  const indexB = COLLECTION_ORDER.indexOf(b.id);
  const normalizedA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
  const normalizedB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

  if (normalizedA !== normalizedB) return normalizedA - normalizedB;
  return a.label.localeCompare(b.label);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toIsoDate(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (isRecord(value) && typeof value.toDate === "function") {
    const date = (value.toDate as () => Date)();
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function documentPrimaryDate(data: DocumentData): string | null {
  const dates = DATE_FIELDS.map((field) => toIsoDate(data[field])).filter(
    (date): date is string => Boolean(date),
  );

  if (dates.length === 0) return null;
  return dates.sort((a, b) => b.localeCompare(a))[0]!;
}

function serializeFirestoreValue(value: unknown): JsonValue {
  if (value === undefined || value === null) return null;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  const isoDate = toIsoDate(value);
  if (isoDate) return isoDate;

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }

  if (Buffer.isBuffer(value)) {
    return { type: "Buffer", bytes: value.length };
  }

  if (value instanceof Uint8Array) {
    return { type: "Bytes", bytes: value.byteLength };
  }

  if (isRecord(value)) {
    if (
      typeof value.path === "string" &&
      typeof value.id === "string" &&
      "parent" in value
    ) {
      return { type: "DocumentReference", path: value.path };
    }

    if (
      typeof value.latitude === "number" &&
      typeof value.longitude === "number"
    ) {
      return {
        type: "GeoPoint",
        latitude: value.latitude,
        longitude: value.longitude,
      };
    }

    return Object.entries(value).reduce<Record<string, JsonValue>>(
      (acc, [key, nested]) => {
        acc[key] = serializeFirestoreValue(nested);
        return acc;
      },
      {},
    );
  }

  return String(value);
}

function serializeDocumentData(data: DocumentData): Record<string, JsonValue> {
  return Object.entries(data).reduce<Record<string, JsonValue>>(
    (acc, [key, value]) => {
      acc[key] = serializeFirestoreValue(value);
      return acc;
    },
    {},
  );
}

function uniqueFields(documents: AdminFirestoreDocument[]): string[] {
  return Array.from(new Set(documents.flatMap((document) => document.fields))).sort(
    (a, b) => a.localeCompare(b),
  );
}

async function readCollection(
  collection: CollectionReference<DocumentData>,
): Promise<AdminFirestoreCollection> {
  const snapshot = await collection.get();
  const documents = snapshot.docs
    .map((document) => {
      const data = document.data();
      const fields = Object.keys(data).sort((a, b) => a.localeCompare(b));

      return {
        id: document.id,
        path: document.ref.path,
        data: serializeDocumentData(data),
        fields,
        primaryDate: documentPrimaryDate(data),
      };
    })
    .sort((a, b) => {
      if (a.primaryDate && b.primaryDate) {
        return b.primaryDate.localeCompare(a.primaryDate);
      }
      if (a.primaryDate) return -1;
      if (b.primaryDate) return 1;
      return a.id.localeCompare(b.id);
    });

  return {
    id: collection.id,
    label: collectionLabel(collection.id),
    path: collection.path,
    total: documents.length,
    latestAt: documents.find((document) => document.primaryDate)?.primaryDate ?? null,
    fields: uniqueFields(documents),
    documents,
  };
}

function collectionById(
  collections: AdminFirestoreCollection[],
  id: string,
): AdminFirestoreCollection | undefined {
  return collections.find((collection) => collection.id === id);
}

function countDocuments(
  collections: AdminFirestoreCollection[],
  id: string,
): number {
  return collectionById(collections, id)?.total ?? 0;
}

function countByField(
  collection: AdminFirestoreCollection | undefined,
  field: string,
): Record<string, number> {
  return (collection?.documents ?? []).reduce<Record<string, number>>(
    (acc, document) => {
      const value = document.data[field];
      if (typeof value !== "string") return acc;
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {},
  );
}

function countArrayItems(
  collection: AdminFirestoreCollection | undefined,
  field: string,
): number {
  return (collection?.documents ?? []).reduce((total, document) => {
    const value = document.data[field];
    return total + (Array.isArray(value) ? value.length : 0);
  }, 0);
}

function buildMetrics(
  collections: AdminFirestoreCollection[],
): AdminDashboardMetric[] {
  const totalDocuments = collections.reduce(
    (total, collection) => total + collection.total,
    0,
  );
  const comments = collectionById(collections, "comments");
  const users = collectionById(collections, "users");
  const commentStatuses = countByField(comments, "status");
  const reactionCounts = countByField(
    collectionById(collections, "page_reactions"),
    "reaction",
  );
  const totalReactions = Object.values(reactionCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const totalBookmarks = countArrayItems(users, "bookmarks");
  const totalFavourites = countArrayItems(users, "favourites");

  return [
    {
      id: "collections",
      label: "Collections",
      value: collections.length,
      detail: "Root Firestore collections",
    },
    {
      id: "documents",
      label: "Documents",
      value: totalDocuments,
      detail: "Documents loaded from Firestore",
    },
    {
      id: "users",
      label: "User profiles",
      value: countDocuments(collections, "users"),
      detail: `${totalBookmarks} bookmarks / ${totalFavourites} favourites`,
    },
    {
      id: "comments",
      label: "Comments",
      value: countDocuments(collections, "comments"),
      detail: `${commentStatuses.APPROVED ?? 0} approved / ${
        commentStatuses.PENDING ?? 0
      } pending / ${commentStatuses.SPAM ?? 0} spam`,
    },
    {
      id: "contacts",
      label: "Contact messages",
      value: countDocuments(collections, "contacts"),
      detail: "Messages from the contact form",
    },
    {
      id: "newsletter",
      label: "Newsletter",
      value: countDocuments(collections, "newsletter"),
      detail: "Subscriber records",
    },
    {
      id: "submissions",
      label: "Contributions",
      value: countDocuments(collections, "submissions"),
      detail: "Reader contribution submissions",
    },
    {
      id: "engagement",
      label: "Engagement",
      value: countDocuments(collections, "engagement_submissions"),
      detail: "Engagement form submissions",
    },
    {
      id: "reactions",
      label: "Page reactions",
      value: totalReactions,
      detail: "Reader reactions across issue pages",
    },
  ];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const db = getAdminDb();
  const rootCollections = await db.listCollections();
  const collections = (await Promise.all(rootCollections.map(readCollection))).sort(
    orderCollections,
  );

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildMetrics(collections),
    collections,
  };
}
