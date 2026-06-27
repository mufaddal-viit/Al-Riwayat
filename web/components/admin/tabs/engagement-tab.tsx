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
import { ChartCard, ChartLegend } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { StatusDonutChart } from "../charts/status-donut-chart";
import { CategoryBarChart } from "../charts/category-bar-chart";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { CATEGORICAL, STATUS_COLORS } from "../charts/palette";
import { Card, CardContent } from "@/components/ui/card";
import { ModerationPanel } from "../moderation-panel";
import { fmtDate, str, StatusPill } from "../row-helpers";
import type { AdminCollectionDoc } from "@/services/adminCollectionsService";

const COMMENT_STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approved",
  PENDING: "Pending",
  SPAM: "Spam",
};

export function EngagementTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");

  const commentDocs = docs(data, "comments");
  const reactionDocs = docs(data, "page_reactions");
  const engagementDocs = docs(data, "engagement_submissions");

  const commentStatus = countByField(commentDocs, "status");
  const commentSlices = toSlices(commentStatus, COMMENT_STATUS_LABELS);

  const reactionByType = toSlices(countByField(reactionDocs, "reaction"));
  const reactionByPage = useMemo(() => {
    const counts = countByField(reactionDocs, "pageSlug");
    return toSlices(counts).slice(0, 6);
  }, [reactionDocs]);

  const commentsTrend = useMemo(
    () => weeklyTimeline([{ key: "comments", documents: commentDocs }], range),
    [commentDocs, range],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Comment moderation" description="By status">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <StatusDonutChart
              data={commentSlices}
              colorFor={(label) => {
                const key =
                  Object.keys(COMMENT_STATUS_LABELS).find(
                    (k) => COMMENT_STATUS_LABELS[k] === label,
                  ) ?? label;
                return STATUS_COLORS[key] ?? "var(--muted)";
              }}
              centerValue={commentDocs.length}
              centerLabel="comments"
            />
            <ChartLegend
              items={commentSlices.map((slice) => {
                const key =
                  Object.keys(COMMENT_STATUS_LABELS).find(
                    (k) => COMMENT_STATUS_LABELS[k] === slice.label,
                  ) ?? slice.label;
                return {
                  label: slice.label,
                  color: STATUS_COLORS[key] ?? "var(--muted)",
                  value: slice.value,
                };
              })}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Reactions by type"
          description={`${reactionDocs.length} total reactions`}
        >
          {reactionByType.length > 0 ? (
            <CategoryBarChart
              data={reactionByType}
              colorFor={(_, index) => CATEGORICAL[index % CATEGORICAL.length]}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="Most-reacted pages" description="Top 6 by reaction count">
          {reactionByPage.length > 0 ? (
            <CategoryBarChart
              data={reactionByPage}
              layout="vertical"
              height={260}
              colorFor={() => "var(--primary)"}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      {engagementDocs.length > 0 && (
        <ChartCard
          title="Engagement submissions over time"
          description="Reader engagement form activity"
        >
          <TrendAreaChart
            data={weeklyTimeline(
              [{ key: "engagement", documents: engagementDocs }],
              range,
            )}
            series={[{ key: "engagement", label: "Engagement" }]}
            height={220}
          />
        </ChartCard>
      )}

      {/* Comment moderation */}
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
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
                  <span className="font-medium">{str(doc, "authorName") || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">
                    on {str(doc, "pageSlug")}
                  </span>
                </div>
                <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
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

      {/* Engagement submissions */}
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="p-5">
          <ModerationPanel
            resource="engagement"
            title="Engagement submissions"
            emptyLabel="No engagement submissions."
            renderRow={(doc: AdminCollectionDoc) => (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{str(doc, "name") || "—"}</span>
                  <span className="text-xs text-muted-foreground">
                    {str(doc, "email")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {str(doc, "occupation")} · {fmtDate(str(doc, "submittedAt"))}
                </p>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      No data yet.
    </div>
  );
}
