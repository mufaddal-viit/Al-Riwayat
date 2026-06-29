"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Database,
  FileText,
  Inbox,
  LogOut,
  Mail,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getAdminDashboard } from "@/services/adminDashboardService";
import type { AdminDashboardData } from "@/types/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLogin } from "@/components/admin/admin-login";
import { OverviewTab } from "@/components/admin/tabs/overview-tab";
import { ContributionsTab } from "@/components/admin/tabs/contributions-tab";
import { CommentsTab } from "@/components/admin/tabs/comments-tab";
import { EngagementTab } from "@/components/admin/tabs/engagement-tab";
import { ContactsTab } from "@/components/admin/tabs/contacts-tab";
import { NewsletterTab } from "@/components/admin/tabs/newsletter-tab";
import { DataTab } from "@/components/admin/tabs/data-tab";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "contributions", label: "Contributions", icon: FileText },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "engagement", label: "Engagement", icon: Sparkles },
  { key: "contacts", label: "Contacts", icon: Inbox },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "data", label: "Data", icon: Database },
] as const;

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
  const [activeTab, setActiveTab] = useState<string>("overview");

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
    setActiveTab("overview");
  }

  if (isCheckingSession) return <AdminSkeleton />;
  if (!sessionEmail) return <AdminLogin onAuthenticated={setSessionEmail} />;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/80">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Al-Riwayat Admin
            </p>
            <h1 className="font-heading text-3xl leading-tight">Dashboard</h1>
            <p className="truncate text-sm text-muted-foreground">{sessionEmail}</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="w-max">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab data={dashboard} onNavigate={setActiveTab} />
          </TabsContent>
          <TabsContent value="contributions">
            <ContributionsTab data={dashboard} />
          </TabsContent>
          <TabsContent value="comments">
            <CommentsTab data={dashboard} />
          </TabsContent>
          <TabsContent value="engagement">
            <EngagementTab data={dashboard} />
          </TabsContent>
          <TabsContent value="contacts">
            <ContactsTab data={dashboard} />
          </TabsContent>
          <TabsContent value="newsletter">
            <NewsletterTab data={dashboard} />
          </TabsContent>
          <TabsContent value="data">
            <DataTab data={dashboard} />
          </TabsContent>
        </Tabs>
      ) : (
        <AdminSkeleton />
      )}
    </main>
  );
}
