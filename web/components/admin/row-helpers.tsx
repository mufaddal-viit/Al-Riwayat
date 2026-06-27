import type { AdminCollectionDoc } from "@/services/adminCollectionsService";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function str(doc: AdminCollectionDoc, field: string): string {
  const value = doc.data[field];
  return typeof value === "string" ? value : "";
}

export function bool(doc: AdminCollectionDoc, field: string): boolean {
  return doc.data[field] === true;
}

export function fmtDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

const STATUS_PILL: Record<string, string> = {
  APPROVED: "bg-primary/15 text-primary",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  SPAM: "bg-destructive/15 text-destructive",
  new: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  read: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        STATUS_PILL[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
