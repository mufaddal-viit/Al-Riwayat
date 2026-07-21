import crypto from "crypto";
import type { Request, Response } from "express";

import { env } from "../../lib/env";
import type { AdStatsParams, AdStatsQuery } from "./ads.stats.schema";
import { recordAdEventsSchema } from "./ads.stats.schema";
import { getAdStats, recordEvents, resetAdStats } from "./ads.stats.service";

/** Obvious bot/crawler user agents whose events we drop before counting. */
const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|preview|monitor|curl|wget|python-requests/i;

/** Best-effort client IP behind Vercel's proxy (first x-forwarded-for hop). */
function clientIp(req: Request): string {
  const fwd = req.header("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.socket.remoteAddress ?? "";
}

/**
 * Anonymized visitor fingerprint for counting UNIQUE devices. It is a salted
 * SHA-256 of IP + user-agent — the raw IP is NEVER stored, only this one-way
 * hash. The salt (the JWT secret, always present) prevents reversing it.
 */
function visitorFingerprint(req: Request): string {
  const ip = clientIp(req);
  const ua = req.header("user-agent") ?? "";
  if (!ip && !ua) return "";
  return crypto
    .createHmac("sha256", env.JWT_ACCESS_SECRET)
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * POST /api/ads/events — public, batched event ingestion from the browser.
 *
 * Integrity basics: only accepted from an allowed site Origin (defense in depth
 * against off-site spam), bot user agents are dropped, the body is validated and
 * capped, and the route is rate-limited upstream. Per-session impression
 * de-duplication happens client-side. Always returns 204 so a reader page never
 * sees an error from tracking.
 */
export async function recordAdEventsController(req: Request, res: Response) {
  try {
    // Only count events that originate from our own site. sendBeacon/fetch send
    // an Origin header; requests from other sites (or scripts) are ignored.
    const origin = req.header("origin");
    if (origin && !env.ALLOWED_ORIGIN.includes(origin)) {
      res.status(204).end();
      return;
    }

    const ua = req.header("user-agent") ?? "";
    if (BOT_UA.test(ua)) {
      res.status(204).end();
      return;
    }

    const parsed = recordAdEventsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(204).end();
      return;
    }

    await recordEvents(parsed.data.events, visitorFingerprint(req));
    res.status(204).end();
  } catch (error) {
    console.error("Failed to record ad events.", error);
    // Never surface tracking failures to the client.
    res.status(204).end();
  }
}

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 29); // last 30 days inclusive
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

/** GET /api/admin/dashboard/ads/:id/stats?from=&to= — admin summary. */
export async function getAdStatsController(
  req: Request<AdStatsParams, unknown, unknown, AdStatsQuery>,
  res: Response,
) {
  try {
    const fallback = defaultRange();
    const from = req.query.from ?? fallback.from;
    const to = req.query.to ?? fallback.to;

    const summary = await getAdStats(req.params.id, from, to);
    if (!summary) {
      return res.status(404).json({ success: false, message: "Ad not found." });
    }
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error(`Failed to load stats for ad "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load stats right now." });
  }
}

/** DELETE /api/admin/dashboard/ads/:id/stats — wipe an ad's recorded stats. */
export async function resetAdStatsController(
  req: Request<AdStatsParams>,
  res: Response,
) {
  try {
    await resetAdStats(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Stats cleared." });
  } catch (error) {
    console.error(`Failed to reset stats for ad "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to reset stats right now." });
  }
}
