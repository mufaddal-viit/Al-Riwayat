import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "../../lib/firebase-admin";
import type { CreateClientInput, UpdateClientInput } from "./clients.schema";
import type { ClientStatus, ClientTier } from "./clients.types";

const COLLECTION = "clients";

interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface StoredClient {
  name: string;
  legalName?: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  status?: ClientStatus;
  tier?: ClientTier;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingEmail?: string;
  billingAddress?: BillingAddress;
  taxId?: string;
  vatNumber?: string;
  currency?: string;
  paymentTerms?: string;
  accountManagerId?: string;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  contractUrl?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  totalSpend?: number;
  activeCampaignsCount?: number;
  notes?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  archivedAt?: Timestamp | null;
}

export interface AdminClient {
  id: string;
  name: string;
  legalName: string;
  logoUrl: string;
  industry: string;
  website: string;
  status: ClientStatus;
  tier: ClientTier;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingEmail: string;
  billingAddress: Required<BillingAddress>;
  taxId: string;
  vatNumber: string;
  currency: string;
  paymentTerms: string;
  accountManagerId: string;
  contractStartDate: string | null;
  contractEndDate: string | null;
  contractUrl: string;
  creditLimit: number | null;
  outstandingBalance: number | null;
  totalSpend: number | null;
  activeCampaignsCount: number | null;
  notes: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToIso(value: Timestamp | null | undefined): string | null {
  return value ? value.toDate().toISOString() : null;
}

function toAdmin(id: string, data: StoredClient): AdminClient {
  const addr = data.billingAddress ?? {};
  return {
    id,
    name: data.name ?? "Untitled",
    legalName: data.legalName ?? "",
    logoUrl: data.logoUrl ?? "",
    industry: data.industry ?? "",
    website: data.website ?? "",
    status: data.status ?? "active",
    tier: data.tier ?? "standard",
    contactName: data.contactName ?? "",
    contactEmail: data.contactEmail ?? "",
    contactPhone: data.contactPhone ?? "",
    billingEmail: data.billingEmail ?? "",
    billingAddress: {
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      country: addr.country ?? "",
      postalCode: addr.postalCode ?? "",
    },
    taxId: data.taxId ?? "",
    vatNumber: data.vatNumber ?? "",
    currency: data.currency ?? "INR",
    paymentTerms: data.paymentTerms ?? "",
    accountManagerId: data.accountManagerId ?? "",
    contractStartDate: data.contractStartDate ?? null,
    contractEndDate: data.contractEndDate ?? null,
    contractUrl: data.contractUrl ?? "",
    creditLimit: data.creditLimit ?? null,
    outstandingBalance: data.outstandingBalance ?? null,
    totalSpend: data.totalSpend ?? null,
    activeCampaignsCount: data.activeCampaignsCount ?? null,
    notes: data.notes ?? "",
    tags: data.tags ?? [],
    createdBy: data.createdBy ?? "",
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: tsToIso(data.updatedAt) ?? new Date(0).toISOString(),
    archivedAt: tsToIso(data.archivedAt),
  };
}

/** Strip undefined so Firestore writes stay clean and partial updates work. */
function defined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function listClients(filters?: {
  status?: ClientStatus;
  tier?: ClientTier;
}): Promise<AdminClient[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs
    .map((d) => toAdmin(d.id, d.data() as StoredClient))
    .filter((c) => !filters?.status || c.status === filters.status)
    .filter((c) => !filters?.tier || c.tier === filters.tier)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function findClientById(id: string): Promise<AdminClient | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toAdmin(doc.id, doc.data() as StoredClient);
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function createClient(
  input: CreateClientInput,
  createdBy: string,
): Promise<AdminClient> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc();

  await ref.set(
    defined({
      ...input,
      createdBy,
      archivedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }),
  );

  const created = await ref.get();
  return toAdmin(created.id, created.data() as StoredClient);
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<AdminClient | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const patch: Record<string, unknown> = defined({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Toggle archivedAt in step with an explicit status change.
  if (input.status === "archived") patch.archivedAt = FieldValue.serverTimestamp();
  else if (input.status) patch.archivedAt = null;

  await ref.update(patch);
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredClient);
}

export async function archiveClient(id: string): Promise<AdminClient | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.update({
    status: "archived",
    archivedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const updated = await ref.get();
  return toAdmin(updated.id, updated.data() as StoredClient);
}

export async function deleteClient(id: string): Promise<AdminClient | null> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;
  const snapshot = toAdmin(existing.id, existing.data() as StoredClient);
  await ref.delete();
  return snapshot;
}
