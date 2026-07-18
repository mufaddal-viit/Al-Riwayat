"use client";

import { useMemo, useState } from "react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  countByField,
  docs,
  toSlices,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import type { AdminCollectionDoc } from "@/services/adminCollectionsService";
import { Card, CardContent } from "@/components/ui/card";
import { ChartCard, ChartLegend } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatusDonutChart } from "../charts/status-donut-chart";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { STATUS_COLORS } from "../charts/palette";
import { ModerationPanel } from "../moderation-panel";
import { fmtDate, str, StatusPill } from "../row-helpers";

const COMMENT_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approved",
  PENDING: "Pending",
  SPAM: "Spam",
};

function statusKeyFromLabel(label: string): string {
  return (
    Object.keys(COMMENT_STATUS_LABELS).find(
      (key) => COMMENT_STATUS_LABELS[key] === label,
    ) ?? label
  );
}

export function CommentsTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");

  const commentDocs = docs(data, "comments");
  const commentStatus = countByField(commentDocs, "status");
  const commentSlices = toSlices(commentStatus, COMMENT_STATUS_LABELS);

  const commentsTrend = useMemo(
    () => weeklyTimeline([{ key: "comments", documents: commentDocs }], range),
    [commentDocs, range],
  );

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="By status" description="Comment moderation state">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <StatusDonutChart
              data={commentSlices}
              colorFor={(label) => STATUS_COLORS[statusKeyFromLabel(label)] ?? "var(--muted)"}
              centerValue={commentDocs.length}
              centerLabel="comments"
            />
            <ChartLegend
              items={commentSlices.map((slice) => ({
                label: slice.label,
                color: STATUS_COLORS[statusKeyFromLabel(slice.label)] ?? "var(--muted)",
                value: slice.value,
              }))}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Comments over time"
          description="Weekly volume"
          className="lg:col-span-2"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={commentsTrend}
            series={[{ key: "comments", label: "Comments" }]}
            height={240}
          />
        </ChartCard>
      </div>

      {/* Moderation */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <ModerationPanel
            resource="comments"
            title="Comment moderation"
            emptyLabel="No comments in this view."
            filters={[
              { key: "pending", label: "Pending", match: (d) => str(d, "status") === "PENDING" },
              { key: "approved", label: "Approved", match: (d) => str(d, "status") === "APPROVED" },
              { key: "spam", label: "Spam", match: (d) => str(d, "status") === "SPAM" },
              { key: "all", label: "All", match: () => true },
            ]}
            actions={[
              {
                label: "Approve",
                action: "approve",
                variant: "default",
                visible: (d) => str(d, "status") !== "APPROVED",
              },
              {
                label: "Spam",
                action: "spam",
                visible: (d) => str(d, "status") !== "SPAM",
              },
            ]}
            renderRow={(doc: AdminCollectionDoc) => (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={str(doc, "status") || "PENDING"} />
                  <span className="font-medium">
                    {str(doc, "authorName") || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    on {str(doc, "pageSlug")}
                  </span>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {str(doc, "body")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(str(doc, "createdAt"))}
                </p>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
