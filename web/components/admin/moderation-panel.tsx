"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Inbox, RefreshCcw, Trash2 } from "lucide-react";

import {
  deleteResource,
  listResource,
  transitionResource,
  type AdminCollectionDoc,
  type AdminResource,
} from "@/services/adminCollectionsService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";

export interface RowAction {
  label: string;
  action: string;
  /** Show this action only when the predicate passes (e.g. not already approved). */
  visible?: (doc: AdminCollectionDoc) => boolean;
  variant?: "default" | "outline";
}

export interface ModerationPanelProps {
  resource: AdminResource;
  title: string;
  /** Render the human-facing summary of a row. */
  renderRow: (doc: AdminCollectionDoc) => ReactNode;
  /** Soft-status actions available per row. */
  actions?: RowAction[];
  allowDelete?: boolean;
  /** Optional client-side filter tabs: label + predicate. */
  filters?: { key: string; label: string; match: (doc: AdminCollectionDoc) => boolean }[];
  emptyLabel?: string;
}

export function ModerationPanel({
  resource,
  title,
  renderRow,
  actions = [],
  allowDelete = true,
  filters,
  emptyLabel = "Nothing here yet.",
}: ModerationPanelProps) {
  const [docs, setDocs] = useState<AdminCollectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(filters?.[0]?.key ?? "all");
  const [pendingDelete, setPendingDelete] = useState<AdminCollectionDoc | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDocs(await listResource(resource));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runTransition(doc: AdminCollectionDoc, action: string) {
    setBusyId(doc.id);
    setError(null);
    try {
      await transitionResource(resource, doc.id, action);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    setError(null);
    try {
      await deleteResource(resource, pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filterFn = filters?.find((f) => f.key === activeFilter)?.match;
  const visibleDocs = filterFn ? docs.filter(filterFn) : docs;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-heading text-xl">{title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
            {docs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {filters && filters.length > 1 && (
            <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeFilter === filter.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                  <span className="ml-1.5 tabular-nums opacity-70">
                    {docs.filter(filter.match).length}
                  </span>
                </button>
              ))}
            </div>
          )}
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
      ) : visibleDocs.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {visibleDocs.map((doc) => {
            const rowActions = actions.filter(
              (action) => !action.visible || action.visible(doc),
            );
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0 flex-1">{renderRow(doc)}</div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {rowActions.map((action) => (
                    <Button
                      key={action.action}
                      type="button"
                      size="sm"
                      variant={action.variant ?? "outline"}
                      onClick={() => runTransition(doc, action.action)}
                      disabled={busyId === doc.id}
                    >
                      {action.label}
                    </Button>
                  ))}
                  {allowDelete && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingDelete(doc)}
                      disabled={busyId === doc.id}
                      className="gap-1.5 text-destructive hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this record?"
        description="This permanently removes the record from Firestore and cannot be undone."
        confirmLabel="Delete"
        destructive
        busy={Boolean(busyId)}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
