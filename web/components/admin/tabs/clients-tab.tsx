"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Plus, RefreshCcw, Trash2, Users } from "lucide-react";

import {
  archiveClient,
  deleteClient,
  listClients,
  type AdminClient,
  type ClientStatus,
} from "@/services/adminClientsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../confirm-dialog";
import { ClientEditor } from "../clients/client-editor";

const FILTERS: { key: ClientStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "archived", label: "Archived" },
];

const STATUS_PILL: Record<ClientStatus, string> = {
  active: "bg-primary/15 text-primary",
  inactive: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  archived: "bg-muted text-muted-foreground",
};

export function ClientsTab() {
  const [items, setItems] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminClient | null | "new">(null);
  const [pendingDelete, setPendingDelete] = useState<AdminClient | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listClients());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    return items.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0 },
    );
  }, [items]);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await deleteClient(pendingDelete.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete client.");
    } finally {
      setBusyId(null);
      setPendingDelete(null);
    }
  }

  async function handleArchive(client: AdminClient) {
    setBusyId(client.id);
    setError(null);
    try {
      await archiveClient(client.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not archive client.");
    } finally {
      setBusyId(null);
    }
  }

  if (editing !== null) {
    return (
      <ClientEditor
        client={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading text-xl">Clients</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
                <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button type="button" size="sm" onClick={() => setEditing("new")} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New client
              </Button>
            </div>
          </div>

          <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
                <span className="ml-1.5 tabular-nums opacity-70">{counts[f.key] ?? 0}</span>
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
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
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No clients here yet.</p>
              <Button type="button" size="sm" onClick={() => setEditing("new")}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add the first client
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {visible.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", STATUS_PILL[item.status])}>
                        {item.status}
                      </span>
                      <p className="font-medium">{item.name}</p>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.tier}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[item.industry, item.contactEmail || item.contactName, item.website]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(item)} disabled={busyId === item.id} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    {item.status !== "archived" && (
                      <Button type="button" size="sm" variant="outline" onClick={() => handleArchive(item)} disabled={busyId === item.id} className="gap-1.5">
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    )}
                    <Button type="button" size="sm" variant="outline" onClick={() => setPendingDelete(item)} disabled={busyId === item.id} aria-label="Delete" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this client?"
        description="This permanently removes the client. Ads referencing it will keep their stored name but lose the link."
        confirmLabel="Delete"
        destructive
        busy={Boolean(busyId)}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
