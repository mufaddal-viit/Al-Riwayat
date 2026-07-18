import type { Request, Response } from "express";

import type { AdServeQuery } from "./ads.schema";
import { serveAds } from "./ads.service";

/** GET /api/ads?placement=X[&device=mobile|desktop] — live ads for a slot. */
export async function serveAdsController(
  req: Request<Record<string, never>, unknown, unknown, AdServeQuery>,
  res: Response,
) {
  try {
    const ads = await serveAds(req.query.placement, req.query.device);
    // Short cache: ads change infrequently but should refresh reasonably fast.
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(200).json({ success: true, data: ads });
  } catch (error) {
    console.error("Failed to serve ads.", error);
    // Never break a reader page on ad failure — return an empty list.
    return res.status(200).json({ success: true, data: [] });
  }
}
