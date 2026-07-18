"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

import {
  createAd,
  updateAd,
  uploadAdImage,
  type AdChannel,
  type AdminAd,
  type AdPayload,
  type AdStatus,
  type TargetDevice,
} from "@/services/adminAdsService";
import { listClients, type AdminClient } from "@/services/adminClientsService";
import { PLACEMENT_OPTIONS, type PlacementKey } from "@/lib/ads/placements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AdImageField, type PendingImage } from "./ad-image-field";

interface AdEditorProps {
  ad: AdminAd | null;
  onClose: () => void;
  onSaved: (ad: AdminAd) => void;
}

const CHANNELS: { value: AdChannel; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "instagram-reel", label: "Instagram Reel" },
  { value: "instagram-status", label: "Instagram Status" },
  { value: "whatsapp", label: "WhatsApp" },
];

const DEVICES: TargetDevice[] = ["mobile", "desktop"];

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function numOrUndef(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function AdEditor({ ad, onClose, onSaved }: AdEditorProps) {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [desktopPending, setDesktopPending] = useState<PendingImage>();
  const [mobilePending, setMobilePending] = useState<PendingImage>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    clientId: "",
    placement: PLACEMENT_OPTIONS[0].key as PlacementKey,
    status: "draft" as AdStatus,
    desktopImageUrl: "",
    mobileImageUrl: "",
    alt: "",
    linkUrl: "",
    openInNewTab: true,
    channels: [] as AdChannel[],
    website: "",
    instagramReel: "",
    instagramStatus: "",
    whatsappPhone: "",
    whatsappMessage: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    startsAt: "",
    endsAt: "",
    priority: "0",
    weight: "1",
    devices: [] as TargetDevice[],
    maxImpressions: "",
    maxClicks: "",
    notes: "",
    campaignId: "",
  });

  useEffect(() => {
    listClients().then(setClients).catch(() => setClients([]));
  }, []);

  useEffect(() => {
    if (!ad) return;
    setForm({
      title: ad.title,
      clientId: ad.clientId,
      placement: ad.placement,
      status: ad.status,
      desktopImageUrl: ad.desktopImageUrl,
      mobileImageUrl: ad.mobileImageUrl,
      alt: ad.alt,
      linkUrl: ad.linkUrl,
      openInNewTab: ad.openInNewTab,
      channels: ad.channels,
      website: ad.links.website,
      instagramReel: ad.links.instagramReel,
      instagramStatus: ad.links.instagramStatus,
      whatsappPhone: ad.links.whatsappPhone,
      whatsappMessage: ad.links.whatsappMessage,
      utmSource: ad.utmSource,
      utmMedium: ad.utmMedium,
      utmCampaign: ad.utmCampaign,
      startsAt: toDateInput(ad.startsAt),
      endsAt: toDateInput(ad.endsAt),
      priority: String(ad.priority),
      weight: String(ad.weight),
      devices: ad.targeting.devices,
      maxImpressions: ad.maxImpressions?.toString() ?? "",
      maxClicks: ad.maxClicks?.toString() ?? "",
      notes: ad.notes,
      campaignId: ad.campaignId,
    });
  }, [ad]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChannel(ch: AdChannel) {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  function toggleDevice(dev: TargetDevice) {
    setForm((prev) => ({
      ...prev,
      devices: prev.devices.includes(dev)
        ? prev.devices.filter((d) => d !== dev)
        : [...prev.devices, dev],
    }));
  }

  async function handleSave() {
    setError(null);
    if (form.title.trim().length < 2) {
      return setError("Ad title must be at least 2 characters.");
    }

    setSaving(true);
    try {
      // Deferred upload: send staged files to Cloudinary now, on save only.
      let desktopUrl = form.desktopImageUrl;
      let mobileUrl = form.mobileImageUrl;
      if (desktopPending) {
        desktopUrl = (await uploadAdImage(desktopPending.file)).url;
        URL.revokeObjectURL(desktopPending.previewUrl);
      }
      if (mobilePending) {
        mobileUrl = (await uploadAdImage(mobilePending.file)).url;
        URL.revokeObjectURL(mobilePending.previewUrl);
      }

      const client = clients.find((c) => c.id === form.clientId);

      const payload: AdPayload = {
        title: form.title.trim(),
        clientId: form.clientId,
        clientName: client?.name ?? "",
        mediaType: "image",
        desktopImageUrl: desktopUrl,
        mobileImageUrl: mobileUrl,
        alt: form.alt.trim(),
        placement: form.placement,
        status: form.status,
        channels: form.channels,
        links: {
          website: form.website.trim(),
          instagramReel: form.instagramReel.trim(),
          instagramStatus: form.instagramStatus.trim(),
          whatsappPhone: form.whatsappPhone.trim(),
          whatsappMessage: form.whatsappMessage.trim(),
        },
        linkUrl: form.linkUrl.trim(),
        openInNewTab: form.openInNewTab,
        utmSource: form.utmSource.trim(),
        utmMedium: form.utmMedium.trim(),
        utmCampaign: form.utmCampaign.trim(),
        priority: numOrUndef(form.priority),
        weight: numOrUndef(form.weight),
        targeting: { devices: form.devices },
        maxImpressions: numOrUndef(form.maxImpressions),
        maxClicks: numOrUndef(form.maxClicks),
        notes: form.notes.trim(),
        campaignId: form.campaignId.trim(),
      };
      if (form.startsAt) payload.startsAt = form.startsAt;
      if (form.endsAt) payload.endsAt = form.endsAt;

      const saved = ad
        ? await updateAd(ad.id, payload)
        : await createAd(payload);
      setDesktopPending(undefined);
      setMobilePending(undefined);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the ad.");
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
          Back to ads
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : ad ? "Save changes" : "Create ad"}
          </Button>
        </div>
      </div>

      <h2 className="font-heading text-2xl">{ad ? "Edit ad" : "New advertisement"}</h2>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Basics">
          <div className="space-y-1.5">
            <Label htmlFor="ad-title" className="text-xs">Title (internal)</Label>
            <Input id="ad-title" value={form.title} onChange={(e) => set("title", e.target.value)} disabled={saving} placeholder="e.g. Ramadan sale — Brand X" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Client</Label>
            <select className={selectClass} value={form.clientId} onChange={(e) => set("clientId", e.target.value)} disabled={saving}>
              <option value="">— No client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Placement</Label>
            <select className={selectClass} value={form.placement} onChange={(e) => set("placement", e.target.value as PlacementKey)} disabled={saving}>
              {PLACEMENT_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">
              {PLACEMENT_OPTIONS.find((p) => p.key === form.placement)?.description}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <select className={selectClass} value={form.status} onChange={(e) => set("status", e.target.value as AdStatus)} disabled={saving}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </Section>

        <Section title="Creatives">
          <p className="text-xs text-muted-foreground">
            Upload a desktop image (required) and, optionally, a mobile image
            for small screens. Recommended:{" "}
            {PLACEMENT_OPTIONS.find((p) => p.key === form.placement)?.guidance.desktop} (desktop),{" "}
            {PLACEMENT_OPTIONS.find((p) => p.key === form.placement)?.guidance.mobile} (mobile).
          </p>
          <AdImageField
            label="Desktop image"
            src={form.desktopImageUrl}
            pending={desktopPending}
            onChange={(next) => {
              if (next.src !== undefined) set("desktopImageUrl", next.src);
              setDesktopPending(next.pending);
            }}
            disabled={saving}
          />
          <AdImageField
            label="Mobile image"
            hint="(optional)"
            src={form.mobileImageUrl}
            pending={mobilePending}
            onChange={(next) => {
              if (next.src !== undefined) set("mobileImageUrl", next.src);
              setMobilePending(next.pending);
            }}
            disabled={saving}
          />
          <div className="space-y-1.5">
            <Label className="text-xs">Alt text</Label>
            <Input value={form.alt} onChange={(e) => set("alt", e.target.value)} disabled={saving} placeholder="Describe the ad for screen readers" />
          </div>
        </Section>

        <Section title="Link & channels">
          <div className="space-y-1.5">
            <Label className="text-xs">Click-through URL</Label>
            <Input value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} disabled={saving} placeholder="https://" />
            <p className="text-xs text-muted-foreground">Tapping the ad opens this link.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.openInNewTab} onChange={(e) => set("openInNewTab", e.target.checked)} disabled={saving} />
            Open in new tab
          </label>

          <div className="space-y-2">
            <Label className="text-xs">Channels (internal tags)</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => toggleChannel(ch.value)}
                  disabled={saving}
                  className={cn(
                    "min-h-[36px] rounded-full border px-3 text-xs font-medium transition-colors",
                    form.channels.includes(ch.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {form.channels.includes("website") && (
            <div className="space-y-1.5">
              <Label className="text-xs">Website URL</Label>
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} disabled={saving} placeholder="https://" />
            </div>
          )}
          {form.channels.includes("instagram-reel") && (
            <div className="space-y-1.5">
              <Label className="text-xs">Instagram Reel URL</Label>
              <Input value={form.instagramReel} onChange={(e) => set("instagramReel", e.target.value)} disabled={saving} placeholder="https://instagram.com/reel/…" />
            </div>
          )}
          {form.channels.includes("instagram-status") && (
            <div className="space-y-1.5">
              <Label className="text-xs">Instagram Status URL</Label>
              <Input value={form.instagramStatus} onChange={(e) => set("instagramStatus", e.target.value)} disabled={saving} placeholder="https://instagram.com/stories/…" />
            </div>
          )}
          {form.channels.includes("whatsapp") && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">WhatsApp number</Label>
                <Input value={form.whatsappPhone} onChange={(e) => set("whatsappPhone", e.target.value)} disabled={saving} placeholder="+91…" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prefilled message</Label>
                <Input value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} disabled={saving} />
              </div>
            </div>
          )}
        </Section>

        <Section title="Schedule & delivery">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Starts</Label>
              <Input type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ends</Label>
              <Input type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Input inputMode="numeric" value={form.priority} onChange={(e) => set("priority", e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Weight</Label>
              <Input inputMode="numeric" value={form.weight} onChange={(e) => set("weight", e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Max impressions</Label>
              <Input inputMode="numeric" value={form.maxImpressions} onChange={(e) => set("maxImpressions", e.target.value)} disabled={saving} placeholder="unlimited" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max clicks</Label>
              <Input inputMode="numeric" value={form.maxClicks} onChange={(e) => set("maxClicks", e.target.value)} disabled={saving} placeholder="unlimited" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Show on devices</Label>
            <div className="flex flex-wrap gap-2">
              {DEVICES.map((dev) => (
                <button
                  key={dev}
                  type="button"
                  onClick={() => toggleDevice(dev)}
                  disabled={saving}
                  className={cn(
                    "min-h-[36px] rounded-full border px-3 text-xs font-medium capitalize transition-colors",
                    form.devices.includes(dev)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {dev}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Leave empty to show on all devices.</p>
          </div>
        </Section>

        <Section title="Tracking (UTM)">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Input value={form.utmSource} onChange={(e) => set("utmSource", e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Medium</Label>
              <Input value={form.utmMedium} onChange={(e) => set("utmMedium", e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign</Label>
              <Input value={form.utmCampaign} onChange={(e) => set("utmCampaign", e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Campaign ID</Label>
            <Input value={form.campaignId} onChange={(e) => set("campaignId", e.target.value)} disabled={saving} />
          </div>
        </Section>

        <Section title="Notes">
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} disabled={saving} className="min-h-[100px]" placeholder="Internal notes about this ad." />
        </Section>
      </div>
    </div>
  );
}
