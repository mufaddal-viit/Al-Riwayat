"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, Mail, MailOpen, RefreshCcw } from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import { docs, weeklyTimeline, type RangeKey } from "@/lib/admin/analytics";
import {
  listResource,
  transitionResource,
  type AdminCollectionDoc,
} from "@/services/adminCollectionsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChartCard } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { CopyableEmail } from "../copyable-email";
import { fmtDate, str } from "../row-helpers";

function isUnread(doc: AdminCollectionDoc): boolean {
  const status = str(doc, "status");
  return status !== "read";
}

const FILTERS = [
  { key: "unread", label: "Unread", match: isUnread },
  { key: "read", label: "Read", match: (d: AdminCollectionDoc) => str(d, "status") === "read" },
  { key: "all", label: "All", match: () => true },
] as const;

export function ContactsTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");
  const [rows, setRows] = useState<AdminCollectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("unread");
  const [active, setActive] = useState<AdminCollectionDoc | null>(null);

  const contactDocs = docs(data, "contacts");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listResource("contacts"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(doc: AdminCollectionDoc) {
    setBusyId(doc.id);
    setError(null);
    try {
      await transitionResource("contacts", doc.id, "read");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark as read.");
    } finally {
      setBusyId(null);
    }
  }

  // Open a message; auto-mark it read if it was unread.
  function openMessage(doc: AdminCollectionDoc) {
    setActive(doc);
    if (isUnread(doc) && busyId === null) {
      void markRead(doc);
    }
  }

  const visible = useMemo(() => {
    const matcher = FILTERS.find((f) => f.key === filter)?.match ?? (() => true);
    return rows.filter(matcher);
  }, [rows, filter]);
  const unreadCount = rows.filter(isUnread).length;

  return (
    <div className="space-y-6">
      <ChartCard
        title="Contact messages over time"
        description={`${contactDocs.length} total · ${unreadCount} unread`}
        action={<RangeSwitcher value={range} onChange={setRange} />}
      >
        <TrendAreaChart
          data={weeklyTimeline([{ key: "messages", documents: contactDocs }], range)}
          series={[{ key: "messages", label: "Messages" }]}
          height={220}
        />
      </ChartCard>

      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading text-xl">Contact inbox</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      filter === f.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f.label}
                    <span className="ml-1.5 tabular-nums opacity-70">
                      {rows.filter(f.match).length}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={load}
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
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No messages in this view.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {visible.map((doc) => {
                const unread = isUnread(doc);
                return (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-3.5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {unread && (
                          <span
                            aria-label="Unread"
                            className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                          />
                        )}
                        <span className={cn("font-medium", unread && "text-foreground")}>
                          {str(doc, "name") || "—"}
                        </span>
                        <CopyableEmail email={str(doc, "email")} />
                      </div>
                      <p className="line-clamp-1 max-w-2xl text-sm text-muted-foreground">
                        {str(doc, "message")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDate(str(doc, "createdAt"))}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openMessage(doc)}
                        className="gap-1.5"
                      >
                        <MailOpen className="h-3.5 w-3.5" />
                        Read message
                      </Button>
                      {unread && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => markRead(doc)}
                          disabled={busyId === doc.id}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Full message viewer */}
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Message from {active ? str(active, "name") : ""}
            </DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <CopyableEmail email={str(active, "email")} />
                <span className="text-xs text-muted-foreground">
                  {fmtDate(str(active, "createdAt"))}
                </span>
              </div>
              <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/30 p-4 text-sm leading-7">
                {str(active, "message")}
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild variant="outline">
                  <a href={`mailto:${str(active, "email")}`}>Reply by email</a>
                </Button>
                <Button type="button" onClick={() => setActive(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
