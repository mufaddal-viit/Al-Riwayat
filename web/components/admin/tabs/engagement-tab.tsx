"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, RefreshCcw, Users2 } from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";
import {
  docs,
  toSlices,
  weeklyTimeline,
  type RangeKey,
} from "@/lib/admin/analytics";
import {
  listResource,
  type AdminCollectionDoc,
} from "@/services/adminCollectionsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChartCard } from "../chart-card";
import { RangeSwitcher } from "../range-switcher";
import { CategoryBarChart } from "../charts/category-bar-chart";
import { TrendAreaChart } from "../charts/trend-area-chart";
import { CATEGORICAL } from "../charts/palette";
import { CopyableEmail } from "../copyable-email";
import { fmtDate, str } from "../row-helpers";

// ─── Age groups ───────────────────────────────────────────────────────────────

interface AgeGroup {
  key: string;
  label: string;
  match: (age: number) => boolean;
}

const AGE_GROUPS: AgeGroup[] = [
  { key: "u15", label: "Under 15", match: (a) => a < 15 },
  { key: "15-20", label: "15–20", match: (a) => a >= 15 && a <= 20 },
  { key: "21-25", label: "21–25", match: (a) => a >= 21 && a <= 25 },
  { key: "26-30", label: "26–30", match: (a) => a >= 26 && a <= 30 },
  { key: "31-40", label: "31–40", match: (a) => a >= 31 && a <= 40 },
  { key: "40+", label: "Over 40", match: (a) => a > 40 },
];

function ageOf(doc: AdminCollectionDoc): number | null {
  const value = doc.data.age;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function ageGroupKey(age: number | null): string | null {
  if (age === null) return null;
  return AGE_GROUPS.find((group) => group.match(age))?.key ?? null;
}

export function EngagementTab({ data }: { data: AdminDashboardData }) {
  const [range, setRange] = useState<RangeKey>("12w");
  const [rows, setRows] = useState<AdminCollectionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupation, setOccupation] = useState<string>("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");

  const engagementDocs = docs(data, "engagement_submissions");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listResource("engagement"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Distinct occupations for the filter dropdown.
  const occupations = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      const value = str(row, "occupation").trim();
      if (value) set.add(value);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (occupation !== "all" && str(row, "occupation") !== occupation) {
        return false;
      }
      if (ageGroup !== "all" && ageGroupKey(ageOf(row)) !== ageGroup) {
        return false;
      }
      return true;
    });
  }, [rows, occupation, ageGroup]);

  // Charts derived from the live rows.
  const byOccupation = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const value = str(row, "occupation").trim() || "Unspecified";
      counts[value] = (counts[value] ?? 0) + 1;
    }
    return toSlices(counts).slice(0, 8);
  }, [rows]);

  const byAgeGroup = useMemo(
    () =>
      AGE_GROUPS.map((group) => ({
        label: group.label,
        value: rows.filter((row) => {
          const age = ageOf(row);
          return age !== null && group.match(age);
        }).length,
      })).filter((slice) => slice.value > 0),
    [rows],
  );

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Submissions over time"
          description="Weekly volume"
          action={<RangeSwitcher value={range} onChange={setRange} />}
        >
          <TrendAreaChart
            data={weeklyTimeline(
              [{ key: "engagement", documents: engagementDocs }],
              range,
            )}
            series={[{ key: "engagement", label: "Submissions" }]}
            height={220}
          />
        </ChartCard>

        <ChartCard title="By occupation" description="Top 8">
          {byOccupation.length > 0 ? (
            <CategoryBarChart
              data={byOccupation}
              layout="vertical"
              height={220}
              colorFor={() => "var(--primary)"}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        <ChartCard title="By age group" description="Reader demographics">
          {byAgeGroup.length > 0 ? (
            <CategoryBarChart
              data={byAgeGroup}
              colorFor={(_, index) => CATEGORICAL[index % CATEGORICAL.length]}
              height={220}
            />
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      {/* Submissions list */}
      <Card className="border-border/60 bg-card/80 shadow-editorial backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-heading text-xl">Engagement submissions</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {filtered.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Occupation filter */}
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <select
                  value={occupation}
                  onChange={(event) => setOccupation(event.target.value)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All occupations</option>
                  {occupations.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              {/* Age-group filter */}
              <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setAgeGroup("all")}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    ageGroup === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All ages
                </button>
                {AGE_GROUPS.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setAgeGroup(group.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      ageGroup === group.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

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
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No submissions match these filters.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {filtered.map((row) => {
                const age = ageOf(row);
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{str(row, "name") || "—"}</span>
                        {str(row, "occupation") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            {str(row, "occupation")}
                          </span>
                        )}
                        {age !== null && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            Age {age}
                          </span>
                        )}
                      </div>
                      <CopyableEmail email={str(row, "email")} />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {fmtDate(str(row, "submittedAt"))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
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
