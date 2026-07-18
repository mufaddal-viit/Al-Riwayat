export type ClientStatus = "active" | "inactive" | "archived";
export type ClientTier = "standard" | "premium" | "enterprise";

export interface BillingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
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
  billingAddress: BillingAddress;
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

/** Fields the editor sends; the server fills audit fields and defaults. */
export interface ClientPayload {
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
  billingAddress?: Partial<BillingAddress>;
  taxId?: string;
  vatNumber?: string;
  currency?: string;
  paymentTerms?: string;
  accountManagerId?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractUrl?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  totalSpend?: number;
  activeCampaignsCount?: number;
  notes?: string;
  tags?: string[];
}

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };
  if (!response.ok) throw new Error(payload.message ?? "Request failed.");
  return payload.data as T;
}

export async function listClients(filters?: {
  status?: ClientStatus;
  tier?: ClientTier;
}): Promise<AdminClient[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.tier) params.set("tier", filters.tier);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/admin/clients${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdminClient[]>(response);
}

export async function createClient(payload: ClientPayload): Promise<AdminClient> {
  const response = await fetch(`/api/admin/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminClient>(response);
}

export async function updateClient(
  id: string,
  payload: Partial<ClientPayload>,
): Promise<AdminClient> {
  const response = await fetch(`/api/admin/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminClient>(response);
}

export async function archiveClient(id: string): Promise<AdminClient> {
  const response = await fetch(`/api/admin/clients/${id}/archive`, {
    method: "PATCH",
  });
  return parse<AdminClient>(response);
}

export async function deleteClient(id: string): Promise<AdminClient> {
  const response = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
  return parse<AdminClient>(response);
}
