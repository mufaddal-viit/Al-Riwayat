"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  Percent,
  RefreshCcw,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  getAdStats,
  resetAdStats,
  type AdStatsSummary,
} from "@/services/adminAdStatsService";
import { ConfirmDialog } from "../confirm-dialog";
import type { AdminAd } from "@/services/adminAdsService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatLineChart } from "./stat-line-chart";

interface AdStatsPanelProps {
  ad: AdminAd;
  onClose: () => void;
}

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
] as const;

function rangeFrom(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 font-heading text-2xl tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function DeviceSplit({
  label,
  mobile,
  desktop,
}: {
  label: string;
  mobile: number;
  desktop: number;
}) {
  const total = mobile + desktop;
  const mobilePct = total > 0 ? (mobile / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {mobile.toLocaleString()} mobile · {desktop.toLocaleString()} desktop
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${mobilePct}%` }} />
        <div className="bg-accent" style={{ width: `${100 - mobilePct}%` }} />
      </div>
    </div>
  );
}

function PacingBar({ label, pctValue }: { label: string; pctValue: number | null }) {
  if (pctValue === null) return null;
  const clamped = Math.min(100, Math.max(0, pctValue * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{clamped.toFixed(0)}% of cap</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full", clamped >= 100 ? "bg-destructive" : "bg-primary")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function AdStatsPanel({ ad, onClose }: AdStatsPanelProps) {
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("30");
  const [stats, setStats] = useState<AdStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = rangeFrom(Number(rangeKey));
      setStats(await getAdStats(ad.id, { from, to }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load stats.");
    } finally {
      setLoading(false);
    }
  }, [ad.id, rangeKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleReset() {
    setResetting(true);
    setError(null);
    try {
      await resetAdStats(ad.id);
      setConfirmReset(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset stats.");
    } finally {
      setResetting(false);
    }
  }

  const hasCaps =
    stats && (stats.caps.impressionsPct !== null || stats.caps.clicksPct !== null);

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
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRangeKey(r.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  rangeKey === r.key
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmReset(true)}
            disabled={loading || resetting}
            className="gap-1.5 text-destructive hover:text-destructive"
            title="Clear all recorded stats for this ad"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-2xl">{ad.title}</h2>
        <p className="text-sm text-muted-foreground">
          {ad.clientName || "No client"} · Analytics
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile
              icon={Eye}
              label="Impressions"
              value={stats.totals.impressions.toLocaleString()}
              sub={`${stats.lifetime.impressions.toLocaleString()} all-time`}
            />
            <Tile
              icon={MousePointerClick}
              label="Clicks"
              value={stats.totals.clicks.toLocaleString()}
              sub={`${stats.lifetime.clicks.toLocaleString()} all-time`}
            />
            <Tile
              icon={Percent}
              label="CTR"
              value={pct(stats.totals.ctr)}
              sub={`${pct(stats.lifetime.ctr)} all-time`}
            />
            <Tile
              icon={Smartphone}
              label="Unique devices"
              value={stats.totals.uniqueDevices.toLocaleString()}
              sub="distinct visitors (this range)"
            />
          </div>

          <div className="grid gap-6 rounded-2xl border border-border/60 bg-card/40 p-5 lg:grid-cols-2">
            <StatLineChart
              title="Impressions"
              points={stats.daily.map((d) => ({ date: d.date, value: d.impressions }))}
            />
            <StatLineChart
              title="Clicks"
              points={stats.daily.map((d) => ({ date: d.date, value: d.clicks }))}
              colorVar="var(--accent)"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Device split (this range)
              </h3>
              <DeviceSplit
                label="Impressions"
                mobile={stats.totals.impressionsMobile}
                desktop={stats.totals.impressionsDesktop}
              />
              <DeviceSplit
                label="Clicks"
                mobile={stats.totals.clicksMobile}
                desktop={stats.totals.clicksDesktop}
              />
            </div>

            {hasCaps && (
              <div className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cap pacing (all-time)
                </h3>
                <PacingBar label="Impressions" pctValue={stats.caps.impressionsPct} />
                <PacingBar label="Clicks" pctValue={stats.caps.clicksPct} />
                <p className="text-xs text-muted-foreground">
                  Serving auto-stops when a cap is reached.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset this ad's stats?"
        description="This permanently clears every recorded impression, click, and unique-device count for this ad. Use it to discard test data before a campaign starts."
        confirmLabel="Reset stats"
        destructive
        busy={resetting}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
