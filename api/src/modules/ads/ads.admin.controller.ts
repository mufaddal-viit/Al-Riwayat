import type { Request, Response } from "express";

import type {
  AdIdParams,
  AdListQuery,
  CreateAdInput,
  UpdateAdInput,
} from "./ads.schema";
import {
  archiveAd as archiveAdRecord,
  createAd as createAdRecord,
  deleteAd as deleteAdRecord,
  findAdById,
  listAds,
  publishAd as publishAdRecord,
  unpublishAd as unpublishAdRecord,
  updateAd as updateAdRecord,
} from "./ads.service";

const notFound = (res: Response) =>
  res.status(404).json({ success: false, message: "Ad not found." });

function actorEmail(req: Request): string {
  return req.header("x-admin-email") ?? "";
}

export async function listAdsController(
  req: Request<Record<string, never>, unknown, unknown, AdListQuery>,
  res: Response,
) {
  try {
    const ads = await listAds({
      status: req.query.status,
      placement: req.query.placement,
      clientId: req.query.clientId,
    });
    return res.status(200).json({ success: true, data: ads });
  } catch (error) {
    console.error("Failed to list ads.", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load ads right now." });
  }
}

export async function getAdController(req: Request<AdIdParams>, res: Response) {
  try {
    const ad = await findAdById(req.params.id);
    if (!ad) return notFound(res);
    return res.status(200).json({ success: true, data: ad });
  } catch (error) {
    console.error(`Failed to fetch ad "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load the ad right now." });
  }
}

export async function createAdController(
  req: Request<Record<string, never>, unknown, CreateAdInput>,
  res: Response,
) {
  try {
    const ad = await createAdRecord(req.body, actorEmail(req));
    return res.status(201).json({ success: true, data: ad });
  } catch (error) {
    console.error("Failed to create ad.", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create the ad right now." });
  }
}

export async function updateAdController(
  req: Request<AdIdParams, unknown, UpdateAdInput>,
  res: Response,
) {
  try {
    const ad = await updateAdRecord(req.params.id, req.body);
    if (!ad) return notFound(res);
    return res.status(200).json({ success: true, data: ad });
  } catch (error) {
    console.error(`Failed to update ad "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update the ad right now." });
  }
}

function lifecycleHandler(
  fn: (id: string) => Promise<unknown>,
  failMessage: string,
) {
  return async (req: Request<AdIdParams>, res: Response) => {
    try {
      const ad = await fn(req.params.id);
      if (!ad) return notFound(res);
      return res.status(200).json({ success: true, data: ad });
    } catch (error) {
      console.error(`${failMessage} "${req.params.id}".`, error);
      return res.status(500).json({ success: false, message: failMessage });
    }
  };
}

export const publishAdController = lifecycleHandler(
  publishAdRecord,
  "Unable to publish the ad.",
);
export const unpublishAdController = lifecycleHandler(
  unpublishAdRecord,
  "Unable to unpublish the ad.",
);
export const archiveAdController = lifecycleHandler(
  archiveAdRecord,
  "Unable to archive the ad.",
);

export async function deleteAdController(
  req: Request<AdIdParams>,
  res: Response,
) {
  try {
    const ad = await deleteAdRecord(req.params.id);
    if (!ad) return notFound(res);
    return res
      .status(200)
      .json({ success: true, message: "Ad deleted.", data: ad });
  } catch (error) {
    console.error(`Failed to delete ad "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete the ad right now." });
  }
}
