import type { Request, Response } from "express";

import { env } from "../../lib/env";
import { resourceConfig } from "./admin-collections.config";
import {
  deleteDoc,
  listCollection,
  updateDoc,
} from "./admin-collections.repo.firestore";

function ensureFirestore(res: Response): boolean {
  if (env.DATA_BACKEND !== "firestore") {
    res.status(400).json({
      success: false,
      message: "Admin collection moderation requires DATA_BACKEND=firestore.",
    });
    return false;
  }
  return true;
}

type ResourceParams = { resource: string };
type ResourceIdParams = { resource: string; id: string };
type ResourceActionParams = { resource: string; id: string; action: string };

export async function listResource(
  req: Request<ResourceParams>,
  res: Response,
) {
  if (!ensureFirestore(res)) return;
  const config = resourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ success: false, message: "Unknown resource." });
  }

  try {
    const filterField =
      typeof req.query.field === "string" ? req.query.field : undefined;
    const filterValue =
      typeof req.query.value === "string" ? req.query.value : undefined;
    const filter =
      filterField && filterValue
        ? { field: filterField, value: filterValue }
        : undefined;

    const docs = await listCollection(config.collection, filter);
    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error(`Failed to list "${req.params.resource}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to load records right now.",
    });
  }
}

export async function transitionResource(
  req: Request<ResourceActionParams>,
  res: Response,
) {
  if (!ensureFirestore(res)) return;
  const config = resourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ success: false, message: "Unknown resource." });
  }

  const action = config.statusActions.find(
    (entry) => entry.action === req.params.action,
  );
  if (!action) {
    return res.status(404).json({
      success: false,
      message: `Unsupported action "${req.params.action}".`,
    });
  }

  try {
    const updated = await updateDoc(config.collection, req.params.id, {
      [action.field]: action.value,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(
      `Failed to ${req.params.action} "${req.params.resource}/${req.params.id}".`,
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Unable to update the record right now.",
    });
  }
}

export async function deleteResource(
  req: Request<ResourceIdParams>,
  res: Response,
) {
  if (!ensureFirestore(res)) return;
  const config = resourceConfig(req.params.resource);
  if (!config) {
    return res.status(404).json({ success: false, message: "Unknown resource." });
  }
  if (!config.allowDelete) {
    return res.status(403).json({
      success: false,
      message: "Delete is not permitted for this resource.",
    });
  }

  try {
    const deleted = await deleteDoc(config.collection, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Record deleted.", data: deleted });
  } catch (error) {
    console.error(
      `Failed to delete "${req.params.resource}/${req.params.id}".`,
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Unable to delete the record right now.",
    });
  }
}
