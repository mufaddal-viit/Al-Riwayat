/**
 * Chart palette — references the site's theme tokens so charts adapt to
 * light/dark automatically, plus a categorical series for multi-series charts.
 */
export const CHART_COLORS = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
  grid: "var(--border)",
  destructive: "var(--destructive)",
} as const;

/** Distinct categorical colors for status / category breakdowns. */
export const CATEGORICAL = [
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  "#7c9a92",
  "#c08552",
  "#8d6b94",
];

export const STATUS_COLORS: Record<string, string> = {
  pending: "#c08552",
  published: "var(--primary)",
  rejected: "var(--muted-foreground)",
  PENDING: "#c08552",
  APPROVED: "var(--primary)",
  SPAM: "var(--destructive)",
};
