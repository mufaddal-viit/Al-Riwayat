"use client";

import { useMemo, useState } from "react";
import { Bookmark, Heart, Mail, UserPlus } from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  cumulative,
  docs,
  sumArrayField,
  total,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import { ChartCard } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatCard } from "../stat-card";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { Card, CardContent } from "@/components/ui/card";
import { ModerationPanel } from "../moderation-panel";
import { bool, fmtDate, str, StatusPill } from "../row-helpers";
import type { AdminCollectionDoc } from "@/services/adminCollectionsService";

export function AudienceTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");

  const userDocs = docs(data, "users");
  const newsletterDocs = docs(data, "newsletter");
  const contactDocs = docs(data, "contacts");

  const bookmarks = sumArrayField(userDocs, "bookmarks");
  const favourites = sumArrayField(userDocs, "favourites");

  // Cumulative newsletter growth.
  const newsletterGrowth = useMemo(() => {
    const weekly = weeklyTimeline(
      [{ key: "subscribers", documents: newsletterDocs }],
      range,
    );
    return cumulative(weekly, "subscribers");
  }, [newsletterDocs, range]);

  const signupTrend = useMemo(
    () => weeklyTimeline([{ key: "signups", documents: userDocs }], range),
    [userDocs, range],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="User profiles"
          value={total(data, "users")}
          icon={UserPlus}
          detail="Registered readers"
        />
        <StatCard
          label="Newsletter"
          value={total(data, "newsletter")}
          icon={Mail}
          detail="Subscribers"
        />
        <StatCard
          label="Bookmarks"
          value={bookmarks}
          icon={Bookmark}
          detail="Saved across all readers"
        />
        <StatCard
          label="Favourites"
          value={favourites}
          icon={Heart}
          detail="Favourited across all readers"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Newsletter growth"
          description="Cumulative subscribers"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={newsletterGrowth}
            series={[
              { key: "subscribers", label: "Subscribers", color: "var(--primary)" },
            ]}
            height={260}
          />
        </ChartCard>

        <ChartCard title="New readers" description="Weekly sign-ups">
          <TrendAreaChart
            data={signupTrend}
            series={[
              { key: "signups", label: "Sign-ups", color: "var(--accent)" },
            ]}
            height={260}
          />
        </ChartCard>
      </div>

      {contactDocs.length > 0 && (
        <ChartCard
          title="Contact messages over time"
          description={`${contactDocs.length} total messages`}
        >
          <TrendAreaChart
            data={weeklyTimeline([{ key: "messages", documents: contactDocs }], range)}
            series={[{ key: "messages", label: "Messages" }]}
            height={220}
          />
        </ChartCard>
      )}

      {/* Contact inbox */}
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="p-5">
          <ModerationPanel
            resource="contacts"
            title="Contact inbox"
            emptyLabel="No contact messages."
            filters={[
              { key: "new", label: "Unread", match: (d) => str(d, "status") !== "read" && str(d, "status") !== "archived" },
              { key: "read", label: "Read", match: (d) => str(d, "status") === "read" },
              { key: "archived", label: "Archived", match: (d) => str(d, "status") === "archived" },
              { key: "all", label: "All", match: () => true },
            ]}
            actions={[
              {
                label: "Mark read",
                action: "read",
                visible: (d) => str(d, "status") !== "read",
              },
              {
                label: "Archive",
                action: "archive",
                visible: (d) => str(d, "status") !== "archived",
              },
            ]}
            renderRow={(doc: AdminCollectionDoc) => (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={str(doc, "status") || "new"} />
                  <span className="font-medium">{str(doc, "name")}</span>
                  <span className="text-xs text-muted-foreground">
                    {str(doc, "email")}
                  </span>
                </div>
                <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                  {str(doc, "message")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(str(doc, "createdAt"))}
                </p>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Newsletter subscribers */}
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="p-5">
          <ModerationPanel
            resource="newsletter"
            title="Newsletter subscribers"
            emptyLabel="No subscribers yet."
            filters={[
              { key: "active", label: "Active", match: (d) => d.data.isActive !== false },
              { key: "inactive", label: "Unsubscribed", match: (d) => d.data.isActive === false },
              { key: "all", label: "All", match: () => true },
            ]}
            actions={[
              {
                label: "Unsubscribe",
                action: "unsubscribe",
                visible: (d) => d.data.isActive !== false,
              },
              {
                label: "Resubscribe",
                action: "resubscribe",
                visible: (d) => d.data.isActive === false,
              },
            ]}
            renderRow={(doc: AdminCollectionDoc) => (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    bool(doc, "isActive") || doc.data.isActive === undefined
                      ? "bg-primary"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="font-medium">{str(doc, "email") || doc.id}</span>
                <span className="text-xs text-muted-foreground">
                  joined {fmtDate(str(doc, "createdAt"))}
                </span>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
