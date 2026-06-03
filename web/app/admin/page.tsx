"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Activity,
  Braces,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  ImageIcon,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  Table2,
  Users,
} from "lucide-react";

import { getAdminDashboard } from "@/services/adminDashboardService";
import type {
  AdminDashboardData,
  AdminFirestoreCollection,
  AdminJsonValue,
} from "@/types/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const numberFormatter = new Intl.NumberFormat("en");
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

function valueToText(value: AdminJsonValue): string {
  if (value === null) return "None";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i;
const IMAGE_FORMATS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
  "ico",
]);

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const size = bytes / 1024 ** exponent;
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isImageUrl(value: string): boolean {
  if (!isHttpUrl(value)) return false;
  if (IMAGE_EXTENSIONS.test(value)) return true;
  // Cloudinary image delivery URLs may omit an extension.
  return /res\.cloudinary\.com\/.+\/image\/upload\//i.test(value);
}

function isPlainRecord(
  value: AdminJsonValue,
): value is { [key: string]: AdminJsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface AssetEntry {
  url: string;
  label: string;
  isImage: boolean;
  meta?: { [key: string]: AdminJsonValue };
}

function labelFromUrl(url: string): string {
  const withoutQuery = url.split("?")[0] ?? url;
  return decodeURIComponent(withoutQuery.split("/").pop() || url);
}

/**
 * Build an asset entry from a stored Cloudinary-style object
 * ({ url, publicId, resourceType, format, bytes }) or null when it isn't one.
 */
function assetFromObject(obj: {
  [key: string]: AdminJsonValue;
}): AssetEntry | null {
  const url = obj.url;
  if (typeof url !== "string" || !isHttpUrl(url)) return null;

  const resourceType =
    typeof obj.resourceType === "string" ? obj.resourceType : "";
  const format = typeof obj.format === "string" ? obj.format.toLowerCase() : "";
  const publicId = typeof obj.publicId === "string" ? obj.publicId : "";
  const isImage =
    resourceType === "image" || IMAGE_FORMATS.has(format) || isImageUrl(url);
  const label = publicId ? labelFromUrl(publicId) : labelFromUrl(url);

  return { url, label, isImage, meta: obj };
}

function assetFromValue(value: AdminJsonValue): AssetEntry | null {
  if (typeof value === "string") {
    return isImageUrl(value)
      ? { url: value, label: labelFromUrl(value), isImage: true }
      : null;
  }
  if (isPlainRecord(value)) {
    return assetFromObject(value);
  }
  return null;
}

/**
 * Detect renderable assets in a Firestore field value: a single image URL, a
 * stored asset object, or an array made up entirely of either. Returns null so
 * the caller can fall back to the default text/JSON rendering.
 */
function extractAssets(value: AdminJsonValue): AssetEntry[] | null {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const entries = value.map(assetFromValue);
    if (entries.some((entry) => entry === null)) return null;
    return entries as AssetEntry[];
  }

  const entry = assetFromValue(value);
  return entry ? [entry] : null;
}

function AssetGallery({ assets }: { assets: AssetEntry[] }) {
  const [active, setActive] = useState<AssetEntry | null>(null);
  const images = assets.filter((asset) => asset.isImage);
  const files = assets.filter((asset) => !asset.isImage);

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((asset) => (
            <button
              key={asset.url}
              type="button"
              onClick={() => setActive(asset)}
              title={asset.label}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {/* Admin-only preview; plain img avoids per-host next/image config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((asset) => (
            <a
              key={asset.url}
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="break-all">{asset.label}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          {active && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 break-all text-base">
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {active.label}
                </DialogTitle>
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.label}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {typeof active.meta?.resourceType === "string" && (
                  <span>Type: {active.meta.resourceType}</span>
                )}
                {typeof active.meta?.format === "string" && (
                  <span>Format: {active.meta.format}</span>
                )}
                {typeof active.meta?.bytes === "number" &&
                  formatBytes(active.meta.bytes) && (
                    <span>{formatBytes(active.meta.bytes)}</span>
                  )}
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open original
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function documentSearchText(collection: AdminFirestoreCollection): string {
  return [
    collection.id,
    collection.label,
    collection.path,
    ...collection.fields,
    ...collection.documents.flatMap((document) => [
      document.id,
      document.path,
      document.primaryDate ?? "",
      ...Object.values(document.data).map(valueToText),
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

function documentMatchesQuery(
  document: AdminFirestoreCollection["documents"][number],
  query: string,
): boolean {
  return [
    document.id,
    document.path,
    document.primaryDate ?? "",
    ...document.fields,
    ...Object.values(document.data).map(valueToText),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function MetricIcon({ id }: { id: string }) {
  const className = "h-5 w-5";

  if (id === "users") return <Users className={className} />;
  if (id === "documents") return <FileText className={className} />;
  if (id === "reactions" || id === "engagement") {
    return <Activity className={className} />;
  }
  return <Database className={className} />;
}

function AdminValue({ value }: { value: AdminJsonValue | undefined }) {
  if (value === undefined || value === null) {
    return <span className="text-muted-foreground">None</span>;
  }

  const assets = extractAssets(value);
  if (assets && assets.length > 0) {
    return <AssetGallery assets={assets} />;
  }

  if (typeof value === "string" && isHttpUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-md items-start gap-1 text-sm text-primary hover:underline"
      >
        <span className="break-all">{value}</span>
        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
      </a>
    );
  }

  const text = valueToText(value);
  const isStructured = typeof value === "object";

  if (isStructured) {
    return (
      <code className="block max-w-md whitespace-pre-wrap break-words rounded-lg bg-muted/50 px-2 py-1 font-mono text-xs leading-5">
        {text}
      </code>
    );
  }

  return (
    <span className="block max-w-md whitespace-pre-wrap break-words text-sm leading-6">
      {text}
    </span>
  );
}

function AdminSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[1.75rem] bg-muted" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[1.75rem] bg-muted" />
    </main>
  );
}

interface AdminSessionResponse {
  authenticated: boolean;
  email: string | null;
  message?: string;
}

function AdminLogin({
  onAuthenticated,
}: {
  onAuthenticated: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as AdminSessionResponse;

      if (!response.ok || !data.authenticated || !data.email) {
        setError(data.message ?? "Invalid admin credentials.");
        return;
      }

      onAuthenticated(data.email);
      setPassword("");
    } catch {
      setError("Could not sign in to the admin dashboard.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md items-center px-4 py-10">
      <Card className="w-full border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Restricted access for Al-Riwayat admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-[1.25rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-base"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function CollectionSection({
  collection,
  isExpanded,
  onToggle,
}: {
  collection: AdminFirestoreCollection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [rawDocs, setRawDocs] = useState<Record<string, boolean>>({});
  const columnCount = collection.fields.length + 2;

  function toggleRaw(path: string) {
    setRawDocs((current) => ({ ...current, [path]: !current[path] }));
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-heading text-xl">
                {collection.label}
              </CardTitle>
              <Badge variant="outline" className="tracking-normal">
                {formatNumber(collection.documents.length)} of{" "}
                {formatNumber(collection.total)}
              </Badge>
            </div>
            <CardDescription className="break-all">
              {collection.path} | Latest {formatDate(collection.latestAt)}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="gap-2"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>

        {collection.fields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collection.fields.map((field) => (
              <span
                key={field}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-0 pb-0">
          {collection.documents.length === 0 ? (
            <div className="border-t border-border/50 px-6 py-8 text-sm text-muted-foreground">
              No matching documents in this collection.
            </div>
          ) : (
            <div className="overflow-x-auto border-t border-border/50">
              <table className="w-full min-w-[840px] border-collapse text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Document
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">
                      Date
                    </th>
                    {collection.fields.map((field) => (
                      <th
                        key={field}
                        className="whitespace-nowrap px-4 py-3 font-medium"
                      >
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collection.documents.map((document) => (
                    <Fragment key={document.path}>
                      <tr className="border-t border-border/40 align-top">
                        <td className="w-56 px-4 py-4">
                          <div className="space-y-1">
                            <p className="break-all font-medium">{document.id}</p>
                            <p className="break-all text-xs text-muted-foreground">
                              {document.path}
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleRaw(document.path)}
                              aria-expanded={Boolean(rawDocs[document.path])}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Braces className="h-3 w-3" />
                              {rawDocs[document.path] ? "Hide raw" : "Raw JSON"}
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                          {formatDate(document.primaryDate)}
                        </td>
                        {collection.fields.map((field) => (
                          <td key={field} className="px-4 py-4">
                            <AdminValue value={document.data[field]} />
                          </td>
                        ))}
                      </tr>
                      {rawDocs[document.path] && (
                        <tr className="border-t border-border/30 bg-muted/20">
                          <td colSpan={columnCount} className="px-4 pb-4">
                            <pre className="max-h-96 overflow-auto rounded-lg bg-background/70 p-3 font-mono text-xs leading-5">
                              {JSON.stringify(document.data, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setExpanded((current) =>
        Object.fromEntries(
          data.collections.map((collection) => [
            collection.id,
            current[collection.id] ?? true,
          ]),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load the admin dashboard.",
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const data = (await response.json()) as AdminSessionResponse;
        if (mounted && data.authenticated && data.email) {
          setSessionEmail(data.email);
        }
      } finally {
        if (mounted) setIsCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;
    void loadDashboard();
  }, [loadDashboard, sessionEmail]);

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    setSessionEmail(null);
    setDashboard(null);
    setExpanded({});
    setQuery("");
    setError(null);
  }

  const visibleCollections = useMemo(() => {
    if (!dashboard) return [];

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return dashboard.collections;

    return dashboard.collections
      .map((collection) => {
        if (documentSearchText(collection).includes(normalizedQuery)) {
          const collectionLabelMatches = [
            collection.id,
            collection.label,
            collection.path,
            ...collection.fields,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

          return {
            ...collection,
            documents: collectionLabelMatches
              ? collection.documents
              : collection.documents.filter((document) =>
                  documentMatchesQuery(document, normalizedQuery),
                ),
          };
        }

        return { ...collection, documents: [] };
      })
      .filter((collection) => collection.documents.length > 0);
  }, [dashboard, query]);

  if (isCheckingSession) {
    return <AdminSkeleton />;
  }

  if (!sessionEmail) {
    return <AdminLogin onAuthenticated={setSessionEmail} />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/80">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Admin
            </p>
            <h1 className="font-heading text-3xl leading-tight">
              Dashboard
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {sessionEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadDashboard}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {dashboard && (
        <p className="text-sm text-muted-foreground">
          Last refreshed {formatDate(dashboard.generatedAt)}
        </p>
      )}

      <Separator className="bg-border/50" />

      {error && (
        <div
          role="alert"
          className="rounded-[1.25rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {dashboard ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <Card
                key={metric.id}
                className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm"
              >
                <CardContent className="flex h-full items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted/50 text-primary">
                    <MetricIcon id={metric.id} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-3xl font-semibold leading-none">
                      {formatNumber(metric.value)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {metric.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Table2 className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-heading text-2xl">Firestore Data</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatNumber(dashboard.collections.length)} Firestore
                  collections loaded.
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Firestore data"
                  className="pl-9"
                />
              </div>
            </div>

            {visibleCollections.length === 0 ? (
              <Card className="border-border/60 bg-card/80 shadow-editorial">
                <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No Firestore documents match the current search.
                </CardContent>
              </Card>
            ) : (
              visibleCollections.map((collection) => (
                <CollectionSection
                  key={collection.id}
                  collection={collection}
                  isExpanded={expanded[collection.id] ?? true}
                  onToggle={() =>
                    setExpanded((current) => ({
                      ...current,
                      [collection.id]: !(current[collection.id] ?? true),
                    }))
                  }
                />
              ))
            )}
          </section>
        </>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-editorial">
          <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
            {error ? "Dashboard data is not available." : "Loading dashboard data."}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
