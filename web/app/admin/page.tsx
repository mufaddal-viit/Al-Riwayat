"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, Menu, RefreshCcw, ShieldCheck } from "lucide-react";

import { getAdminDashboard } from "@/services/adminDashboardService";
import type { AdminDashboardData } from "@/types/admin-dashboard";
import { Button } from "@/components/ui/button";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { OverviewTab } from "@/components/admin/tabs/overview-tab";
import { ContributionsTab } from "@/components/admin/tabs/contributions-tab";
import { WeeklyTab } from "@/components/admin/tabs/weekly-tab";
import { CommentsTab } from "@/components/admin/tabs/comments-tab";
import { EngagementTab } from "@/components/admin/tabs/engagement-tab";
import { ContactsTab } from "@/components/admin/tabs/contacts-tab";
import { NewsletterTab } from "@/components/admin/tabs/newsletter-tab";
import { DataTab } from "@/components/admin/tabs/data-tab";
import { AdsTab } from "@/components/admin/tabs/ads-tab";
import { ClientsTab } from "@/components/admin/tabs/clients-tab";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

interface AdminSessionResponse {
  authenticated: boolean;
  email: string | null;
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[1.75rem] bg-muted" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[1.75rem] bg-muted" />
    </main>
  );
}

export default function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load the admin dashboard.",
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
    setError(null);
    setActiveKey("overview");
  }

  if (isCheckingSession) return <AdminSkeleton />;
  if (!sessionEmail) return <AdminLogin onAuthenticated={setSessionEmail} />;

  const activeLabel =
    ADMIN_NAV.find((item) => item.key === activeKey)?.label ?? "Dashboard";

  function renderView() {
    if (!dashboard) return <AdminSkeleton />;
    switch (activeKey) {
      case "overview":
        return <OverviewTab data={dashboard} onNavigate={setActiveKey} />;
      case "contributions":
        return <ContributionsTab data={dashboard} />;
      case "weekly":
        return <WeeklyTab />;
      case "comments":
        return <CommentsTab data={dashboard} />;
      case "ads":
        return <AdsTab />;
      case "clients":
        return <ClientsTab />;
      case "engagement":
        return <EngagementTab data={dashboard} />;
      case "contacts":
        return <ContactsTab data={dashboard} />;
      case "newsletter":
        return <NewsletterTab data={dashboard} />;
      case "data":
        return <DataTab data={dashboard} />;
      default:
        return null;
    }
  }

  return (
    <main className="w-full px-3 py-5 sm:px-5 lg:px-8">
      <div className="flex gap-6">
        <AdminSidebar
          activeKey={activeKey}
          onSelect={setActiveKey}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/80 text-foreground lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/80 sm:flex">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Al-Riwayat Admin
                </p>
                <h1 className="font-heading text-2xl leading-tight sm:text-3xl">
                  {activeLabel}
                </h1>
                <p className="truncate text-sm text-muted-foreground">
                  {sessionEmail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {dashboard && (
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Updated {formatDate(dashboard.generatedAt)}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={loadDashboard}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[1.25rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {renderView()}
        </div>
      </div>
    </main>
  );
}
