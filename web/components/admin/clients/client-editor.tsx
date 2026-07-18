"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

import {
  createClient,
  updateClient,
  type AdminClient,
  type ClientPayload,
  type ClientStatus,
  type ClientTier,
} from "@/services/adminClientsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ClientEditorProps {
  client: AdminClient | null;
  onClose: () => void;
  onSaved: (client: AdminClient) => void;
}

const STATUSES: ClientStatus[] = ["active", "inactive", "archived"];
const TIERS: ClientTier[] = ["standard", "premium", "enterprise"];

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs">
        {label}
        {hint && (
          <span className="ml-1 font-normal text-muted-foreground">{hint}</span>
        )}
      </Label>
      {children}
    </div>
  );
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function numOrUndef(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function ClientEditor({ client, onClose, onSaved }: ClientEditorProps) {
  const [form, setForm] = useState({
    name: "",
    legalName: "",
    logoUrl: "",
    industry: "",
    website: "",
    status: "active" as ClientStatus,
    tier: "standard" as ClientTier,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    billingEmail: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    taxId: "",
    vatNumber: "",
    currency: "INR",
    paymentTerms: "",
    accountManagerId: "",
    contractStartDate: "",
    contractEndDate: "",
    contractUrl: "",
    creditLimit: "",
    outstandingBalance: "",
    totalSpend: "",
    activeCampaignsCount: "",
    notes: "",
    tagsInput: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    setForm({
      name: client.name,
      legalName: client.legalName,
      logoUrl: client.logoUrl,
      industry: client.industry,
      website: client.website,
      status: client.status,
      tier: client.tier,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      billingEmail: client.billingEmail,
      line1: client.billingAddress.line1,
      line2: client.billingAddress.line2,
      city: client.billingAddress.city,
      state: client.billingAddress.state,
      country: client.billingAddress.country,
      postalCode: client.billingAddress.postalCode,
      taxId: client.taxId,
      vatNumber: client.vatNumber,
      currency: client.currency,
      paymentTerms: client.paymentTerms,
      accountManagerId: client.accountManagerId,
      contractStartDate: toDateInput(client.contractStartDate),
      contractEndDate: toDateInput(client.contractEndDate),
      contractUrl: client.contractUrl,
      creditLimit: client.creditLimit?.toString() ?? "",
      outstandingBalance: client.outstandingBalance?.toString() ?? "",
      totalSpend: client.totalSpend?.toString() ?? "",
      activeCampaignsCount: client.activeCampaignsCount?.toString() ?? "",
      notes: client.notes,
      tagsInput: client.tags.join(", "),
    });
  }, [client]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);
    if (form.name.trim().length < 2) {
      return setError("Client name must be at least 2 characters.");
    }

    const payload: ClientPayload = {
      name: form.name.trim(),
      legalName: form.legalName.trim(),
      logoUrl: form.logoUrl.trim(),
      industry: form.industry.trim(),
      website: form.website.trim(),
      status: form.status,
      tier: form.tier,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      billingEmail: form.billingEmail.trim(),
      billingAddress: {
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
      },
      taxId: form.taxId.trim(),
      vatNumber: form.vatNumber.trim(),
      currency: form.currency.trim() || "INR",
      paymentTerms: form.paymentTerms.trim(),
      accountManagerId: form.accountManagerId.trim(),
      contractUrl: form.contractUrl.trim(),
      creditLimit: numOrUndef(form.creditLimit),
      outstandingBalance: numOrUndef(form.outstandingBalance),
      totalSpend: numOrUndef(form.totalSpend),
      activeCampaignsCount: numOrUndef(form.activeCampaignsCount),
      notes: form.notes.trim(),
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (form.contractStartDate) payload.contractStartDate = form.contractStartDate;
    if (form.contractEndDate) payload.contractEndDate = form.contractEndDate;

    setSaving(true);
    try {
      const saved = client
        ? await updateClient(client.id, payload)
        : await createClient(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : client ? "Save changes" : "Create client"}
          </Button>
        </div>
      </div>

      <h2 className="font-heading text-2xl">
        {client ? "Edit client" : "New client"}
      </h2>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Identity">
          <Field label="Name" htmlFor="c-name">
            <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={saving} placeholder="Client / brand name" />
          </Field>
          <Field label="Legal name" hint="(optional)">
            <Input value={form.legalName} onChange={(e) => set("legalName", e.target.value)} disabled={saving} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} disabled={saving} placeholder="https://" />
            </Field>
          </div>
          <Field label="Logo URL" hint="(optional)">
            <Input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} disabled={saving} placeholder="https://" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select className={selectClass} value={form.status} onChange={(e) => set("status", e.target.value as ClientStatus)} disabled={saving}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Tier">
              <select className={selectClass} value={form.tier} onChange={(e) => set("tier", e.target.value as ClientTier)} disabled={saving}>
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tags" hint="(comma separated)">
            <Input value={form.tagsInput} onChange={(e) => set("tagsInput", e.target.value)} disabled={saving} placeholder="retail, local, priority" />
          </Field>
        </Section>

        <Section title="Contact">
          <Field label="Contact name">
            <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} disabled={saving} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact email">
              <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Contact phone">
              <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} disabled={saving} />
            </Field>
          </div>
          <Field label="Account manager" hint="(id / name)">
            <Input value={form.accountManagerId} onChange={(e) => set("accountManagerId", e.target.value)} disabled={saving} />
          </Field>
        </Section>

        <Section title="Billing">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Billing email">
              <Input type="email" value={form.billingEmail} onChange={(e) => set("billingEmail", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Currency">
              <Input value={form.currency} onChange={(e) => set("currency", e.target.value)} disabled={saving} placeholder="INR" />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tax ID">
              <Input value={form.taxId} onChange={(e) => set("taxId", e.target.value)} disabled={saving} />
            </Field>
            <Field label="VAT number">
              <Input value={form.vatNumber} onChange={(e) => set("vatNumber", e.target.value)} disabled={saving} />
            </Field>
          </div>
          <Field label="Payment terms">
            <Input value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} disabled={saving} placeholder="e.g. Net 30" />
          </Field>
          <Field label="Address line 1">
            <Input value={form.line1} onChange={(e) => set("line1", e.target.value)} disabled={saving} />
          </Field>
          <Field label="Address line 2">
            <Input value={form.line2} onChange={(e) => set("line2", e.target.value)} disabled={saving} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City">
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} disabled={saving} />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} disabled={saving} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Country">
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Postal code">
              <Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} disabled={saving} />
            </Field>
          </div>
        </Section>

        <Section title="Contract & commercial">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Contract start">
              <Input type="date" value={form.contractStartDate} onChange={(e) => set("contractStartDate", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Contract end">
              <Input type="date" value={form.contractEndDate} onChange={(e) => set("contractEndDate", e.target.value)} disabled={saving} />
            </Field>
          </div>
          <Field label="Contract URL" hint="(optional)">
            <Input value={form.contractUrl} onChange={(e) => set("contractUrl", e.target.value)} disabled={saving} placeholder="https://" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Credit limit">
              <Input inputMode="decimal" value={form.creditLimit} onChange={(e) => set("creditLimit", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Outstanding balance">
              <Input inputMode="decimal" value={form.outstandingBalance} onChange={(e) => set("outstandingBalance", e.target.value)} disabled={saving} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Total spend">
              <Input inputMode="decimal" value={form.totalSpend} onChange={(e) => set("totalSpend", e.target.value)} disabled={saving} />
            </Field>
            <Field label="Active campaigns">
              <Input inputMode="numeric" value={form.activeCampaignsCount} onChange={(e) => set("activeCampaignsCount", e.target.value)} disabled={saving} />
            </Field>
          </div>
        </Section>
      </div>

      <Section title="Notes">
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          disabled={saving}
          className={cn("min-h-[100px]")}
          placeholder="Internal notes about this client."
        />
      </Section>
    </div>
  );
}
