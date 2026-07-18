"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface Point {
  date: string;
  value: number;
}

interface StatLineChartProps {
  title: string;
  points: Point[];
  /** Chart line + fill hue. Defaults to the brand primary. */
  colorVar?: string;
  className?: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 26, left: 40 };

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * Single-series time-series line chart, inline SVG (no external library, CSP
 * safe). Thin 2px line over a soft area fill, recessive axes, hover crosshair
 * with a tooltip, and a direct label on the latest point. One measure per chart
 * — impressions and clicks render as two separate charts so neither shares a
 * y-axis with the other (they live on very different scales).
 */
export function StatLineChart({
  title,
  points,
  colorVar = "var(--primary)",
  className,
}: StatLineChartProps) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const { max, coords, areaPath, linePath } = useMemo(() => {
    const values = points.map((p) => p.value);
    const rawMax = Math.max(1, ...values);
    // Round the max up to a tidy ceiling for a stable axis.
    const niceMax = niceCeil(rawMax);
    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const n = points.length;

    const xAt = (i: number) =>
      PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const yAt = (v: number) => PAD.top + innerH - (v / niceMax) * innerH;

    const pts = points.map((p, i) => ({ x: xAt(i), y: yAt(p.value), ...p }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area =
      pts.length > 0
        ? `${line} L${pts[pts.length - 1].x},${PAD.top + innerH} L${pts[0].x},${
            PAD.top + innerH
          } Z`
        : "";
    return { max: niceMax, coords: pts, areaPath: area, linePath: line };
  }, [points]);

  const total = points.reduce((sum, p) => sum + p.value, 0);
  const last = coords[coords.length - 1];
  const active = hover !== null ? coords[hover] : null;

  return (
    <figure className={cn("space-y-2", className)}>
      <figcaption className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {total.toLocaleString()} total
        </span>
      </figcaption>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${title}: ${total} total over ${points.length} days`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorVar} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colorVar} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Recessive gridlines + y labels (0, mid, max) */}
          {[0, 0.5, 1].map((t) => {
            const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * (1 - t);
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
                <text
                  x={PAD.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {Math.round(max * t).toLocaleString()}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={colorVar}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Latest-point marker + direct label */}
          {last && (
            <>
              <circle cx={last.x} cy={last.y} r={3.5} fill={colorVar} />
            </>
          )}

          {/* Hover crosshair + marker */}
          {active && (
            <>
              <line
                x1={active.x}
                x2={active.x}
                y1={PAD.top}
                y2={HEIGHT - PAD.bottom}
                className="stroke-border"
                strokeWidth={1}
              />
              <circle
                cx={active.x}
                cy={active.y}
                r={4}
                fill={colorVar}
                className="stroke-background"
                strokeWidth={2}
              />
            </>
          )}

          {/* First / last x labels */}
          {coords.length > 0 && (
            <>
              <text
                x={coords[0].x}
                y={HEIGHT - 8}
                textAnchor="start"
                className="fill-muted-foreground text-[10px]"
              >
                {shortDate(coords[0].date)}
              </text>
              {last && (
                <text
                  x={last.x}
                  y={HEIGHT - 8}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {shortDate(last.date)}
                </text>
              )}
            </>
          )}

          {/* Invisible hover hit-targets */}
          {coords.map((p, i) => {
            const bandW = (WIDTH - PAD.left - PAD.right) / Math.max(1, coords.length);
            return (
              <rect
                key={p.date}
                x={p.x - bandW / 2}
                y={PAD.top}
                width={bandW}
                height={HEIGHT - PAD.top - PAD.bottom}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            );
          })}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              top: 0,
            }}
          >
            <p className="font-medium tabular-nums text-foreground">
              {active.value.toLocaleString()}
            </p>
            <p className="text-muted-foreground">{shortDate(active.date)}</p>
          </div>
        )}
      </div>
    </figure>
  );
}

/** Round up to a tidy axis ceiling (1, 2, 5 × 10ⁿ). */
function niceCeil(value: number): number {
  if (value <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const frac = value / pow;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * pow;
}
