"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Inbox,
  Pencil,
  RefreshCcw,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  listAdminContributions,
  publishContribution,
  rejectContribution,
  unpublishContribution,
  updateContribution,
  type AdminContribution,
  type ModerationStatus,
} from "@/services/adminContributionsService";
import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  docs,
  toSlices,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard, ChartLegend } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatusDonutChart } from "../charts/status-donut-chart";
import { CategoryBarChart } from "../charts/category-bar-chart";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { CATEGORICAL, STATUS_COLORS } from "../charts/palette";
import { ReviewDialog, type ReviewMode } from "../review-dialog";

const STATUS_TABS: { key: ModerationStatus; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "published", label: "Published", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function ContributionsTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");
  const [statusFilter, setStatusFilter] = useState<ModerationStatus>("pending");
  const [allItems, setAllItems] = useState<AdminContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<AdminContribution | null>(null);
  const [dialogMode, setDialogMode] = useState<ReviewMode>("publish");
  const [busyId, setBusyId] = useState<string | null>(null);

  function openDialog(item: AdminContribution, mode: ReviewMode) {
    setDialogMode(mode);
    setActive(item);
  }

  // ── Live moderation list — load ALL once, derive counts + filtered views ──
  // from it so badges and rows stay consistent and update after every action
  // (the dashboard snapshot is fetched once and would otherwise go stale).
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAllItems(await listAdminContributions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load contributions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Live counts from the loaded items (not the cached snapshot).
  const statusCounts = useMemo(() => {
    return allItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [allItems]);

  const items = useMemo(
    () => allItems.filter((item) => item.status === statusFilter),
    [allItems, statusFilter],
  );

  const totalSubmissions = allItems.length;

  const statusSlices = toSlices({
    pending: statusCounts.pending ?? 0,
    published: statusCounts.published ?? 0,
    rejected: statusCounts.rejected ?? 0,
  });

  // Category breakdown from live items.
  const categorySlices = useMemo(() => {
    const counts = allItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
    return toSlices(counts);
  }, [allItems]);

  // Time trend still uses the dashboard snapshot (it has the createdAt dates).
  const submissionDocs = docs(data, "submissions");
  const trend = useMemo(
    () => weeklyTimeline([{ key: "submissions", documents: submissionDocs }], range),
    [submissionDocs, range],
  );

  const handleSaved = useCallback(() => {
    setActive(null);
    void load();
  }, [load]);

  async function runAction(
    item: AdminContribution,
    fn: (id: string) => Promise<unknown>,
    failMessage: string,
  ) {
    setBusyId(item.id);
    setError(null);
    try {
      await fn(item.id);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : failMessage);
    } finally {
      setBusyId(null);
    }
  }

  const handleReject = (item: AdminContribution) =>
    runAction(item, rejectContribution, "Could not reject.");
  const handleUnpublish = (item: AdminContribution) =>
    runAction(item, unpublishContribution, "Could not unpublish.");
  // Rejected → back into the pending queue (unpublish sets status = pending).
  const handleReconsider = (item: AdminContribution) =>
    runAction(item, unpublishContribution, "Could not move back to pending.");

  return (
    <div className="space-y-6">
      {/* Analytics row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Moderation status" description="Across all submissions">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <StatusDonutChart
              data={statusSlices}
              colorFor={(label) => STATUS_COLORS[label] ?? "var(--muted)"}
              centerValue={totalSubmissions}
              centerLabel="total"
            />
            <ChartLegend
              items={statusSlices.map((slice) => ({
                label: slice.label,
                color: STATUS_COLORS[slice.label] ?? "var(--muted)",
                value: slice.value,
              }))}
            />
          </div>
        </ChartCard>

        <ChartCard title="By category" description="Story, Poetry, Art & more">
          <CategoryBarChart
            data={categorySlices}
            colorFor={(_, index) => CATEGORICAL[index % CATEGORICAL.length]}
          />
        </ChartCard>

        <ChartCard
          title="Submissions over time"
          description="Weekly volume"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={trend}
            series={[{ key: "submissions", label: "Submissions" }]}
            height={220}
          />
        </ChartCard>
      </div>

      {/* Moderation queue */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading text-xl">Moderation queue</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab.key;
                  const count = statusCounts[tab.key] ?? 0;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-background text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                      <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => load()}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No {statusFilter} contributions.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.category}
                      </span>
                      <p className="font-medium">
                        {item.title && item.title !== "Untitled contribution"
                          ? item.title
                          : `Untitled — by ${item.author}`}
                      </p>
                    </div>
                    <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                      {item.originalContent || item.body}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.author} · {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {/* View full — always available */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(item, "view")}
                      disabled={busyId === item.id}
                      className="gap-1.5"
                      aria-label="View full contribution"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>

                    {statusFilter === "pending" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openDialog(item, "publish")}
                          disabled={busyId === item.id}
                          className="gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Review &amp; publish
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(item)}
                          disabled={busyId === item.id}
                          className="gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}

                    {statusFilter === "published" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(item, "edit")}
                          disabled={busyId === item.id}
                          className="gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnpublish(item)}
                          disabled={busyId === item.id}
                        >
                          Unpublish
                        </Button>
                      </>
                    )}

                    {statusFilter === "rejected" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleReconsider(item)}
                        disabled={busyId === item.id}
                        className="gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Move to pending
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        contribution={active}
        mode={dialogMode}
        onClose={() => setActive(null)}
        onSaved={handleSaved}
        publish={publishContribution}
        update={updateContribution}
      />
    </div>
  );
}
