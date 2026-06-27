"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Heart,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  attentionItems,
  countByField,
  docs,
  sparkSeries,
  total,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartCard } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatCard } from "../stat-card";
import { TrendAreaChart } from "../charts/trend-area-chart";

const attentionTone: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-primary/30 bg-primary/10 text-primary",
};

export function OverviewTab({
  data,
  onNavigate,
}: {
  data: AdminDashboardData;
  onNavigate: (tab: string) => void;
}) {
  const [range, setRange] = useState<RangeKey>("12w");

  const submissionDocs = docs(data, "submissions");
  const commentDocs = docs(data, "comments");
  const userDocs = docs(data, "users");
  const newsletterDocs = docs(data, "newsletter");

  const submissionStatus = countByField(submissionDocs, "status");
  const commentStatus = countByField(commentDocs, "status");

  const timeline = useMemo(
    () =>
      weeklyTimeline(
        [
          { key: "contributions", documents: submissionDocs },
          { key: "comments", documents: commentDocs },
          { key: "signups", documents: userDocs },
        ],
        range,
      ),
    [submissionDocs, commentDocs, userDocs, range],
  );

  const attention = attentionItems(data);

  const reactionDocs = docs(data, "page_reactions");

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="User profiles"
          value={total(data, "users")}
          icon={Users}
          spark={sparkSeries(userDocs)}
          detail={`${total(data, "users")} registered readers`}
        />
        <StatCard
          label="Contributions"
          value={total(data, "submissions")}
          icon={FileText}
          spark={sparkSeries(submissionDocs)}
          badge={
            submissionStatus.pending
              ? { text: `${submissionStatus.pending} pending`, tone: "warning" }
              : null
          }
          detail={`${submissionStatus.published ?? 0} published / ${
            submissionStatus.pending ?? 0
          } pending`}
        />
        <StatCard
          label="Comments"
          value={total(data, "comments")}
          icon={MessageSquare}
          spark={sparkSeries(commentDocs)}
          badge={
            commentStatus.PENDING
              ? { text: `${commentStatus.PENDING} pending`, tone: "warning" }
              : null
          }
          detail={`${commentStatus.APPROVED ?? 0} approved / ${
            commentStatus.SPAM ?? 0
          } spam`}
        />
        <StatCard
          label="Newsletter"
          value={total(data, "newsletter")}
          icon={Mail}
          spark={sparkSeries(newsletterDocs)}
          detail="Subscribers"
        />
        <StatCard
          label="Reactions"
          value={reactionDocs.length}
          icon={Heart}
          spark={sparkSeries(reactionDocs)}
          detail="Reader reactions across pages"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity trend */}
        <ChartCard
          title="Activity over time"
          description="Weekly contributions, comments, and new readers"
          className="lg:col-span-2"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={timeline}
            series={[
              { key: "contributions", label: "Contributions" },
              { key: "comments", label: "Comments" },
              { key: "signups", label: "New readers" },
            ]}
          />
        </ChartCard>

        {/* Needs attention */}
        <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-heading text-lg">Needs your attention</h3>
            </div>

            {attention.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You&apos;re all caught up. Nothing needs review.
              </p>
            ) : (
              <ul className="space-y-2">
                {attention.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.tab)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:opacity-90",
                        attentionTone[item.tone],
                      )}
                    >
                      <span className="text-xl font-semibold tabular-nums">
                        {item.count}
                      </span>
                      <span className="flex-1 text-sm font-medium leading-snug">
                        {item.label}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
