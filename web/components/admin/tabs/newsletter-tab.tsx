"use client";

import { useMemo, useState } from "react";
import { Mail } from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  cumulative,
  docs,
  total,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import type { AdminCollectionDoc } from "@/services/adminCollectionsService";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatCard } from "../stat-card";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { ModerationPanel } from "../moderation-panel";
import { CopyableEmail } from "../copyable-email";
import { fmtDate, str } from "../row-helpers";

function isActive(doc: AdminCollectionDoc): boolean {
  return doc.data.isActive !== false;
}

export function NewsletterTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");

  const newsletterDocs = docs(data, "newsletter");

  const growth = useMemo(() => {
    const weekly = weeklyTimeline(
      [{ key: "subscribers", documents: newsletterDocs }],
      range,
    );
    return cumulative(weekly, "subscribers");
  }, [newsletterDocs, range]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard
          label="Subscribers"
          value={total(data, "newsletter")}
          icon={Mail}
          detail="Total newsletter sign-ups"
        />
        <ChartCard
          title="Subscriber growth"
          description="Cumulative over time"
          className="lg:col-span-2"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={growth}
            series={[
              { key: "subscribers", label: "Subscribers", color: "var(--primary)" },
            ]}
            height={220}
          />
        </ChartCard>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="p-5">
          <ModerationPanel
            resource="newsletter"
            title="Subscribers"
            emptyLabel="No subscribers yet."
            filters={[
              { key: "active", label: "Active", match: isActive },
              { key: "inactive", label: "Unsubscribed", match: (d) => !isActive(d) },
              { key: "all", label: "All", match: () => true },
            ]}
            actions={[
              {
                label: "Unsubscribe",
                action: "unsubscribe",
                visible: isActive,
              },
              {
                label: "Resubscribe",
                action: "resubscribe",
                visible: (d) => !isActive(d),
              },
            ]}
            renderRow={(doc: AdminCollectionDoc) => (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive(doc) ? "bg-primary" : "bg-muted-foreground"
                  }`}
                  aria-label={isActive(doc) ? "Active" : "Unsubscribed"}
                />
                <CopyableEmail email={str(doc, "email") || doc.id} />
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
