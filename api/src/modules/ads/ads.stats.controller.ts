import type { Request, Response } from "express";

import type { AdStatsParams, AdStatsQuery } from "./ads.stats.schema";
import { recordAdEventsSchema } from "./ads.stats.schema";
import { getAdStats, recordEvents } from "./ads.stats.service";

/** Obvious bot/crawler user agents whose events we drop before counting. */
const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|preview|monitor|curl|wget|python-requests/i;

/**
 * POST /api/ads/events — public, batched event ingestion from the browser.
 *
 * Integrity basics: bot user agents are dropped, the body is validated and
 * capped (max 50 events), and the route is rate-limited upstream. Per-session
 * impression de-duplication happens client-side. Always returns 204 so a
 * reader page never sees an error from tracking.
 */
export async function recordAdEventsController(req: Request, res: Response) {
  try {
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

    await recordEvents(parsed.data.events);
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
