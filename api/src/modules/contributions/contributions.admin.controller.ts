import type { Request, Response } from "express";

import type {
  AdminContributionListQuery,
  ContributionIdParams,
  PublishContributionInput,
  UpdateContributionInput,
} from "./contributions.schema";
import {
  deleteContribution as deleteContributionRecord,
  findAdminContributionById,
  listAdminContributions,
  publishContribution as publishContributionRecord,
  rejectContribution as rejectContributionRecord,
  unpublishContribution as unpublishContributionRecord,
  updateContribution as updateContributionRecord,
} from "./contributions.service";

const notFound = (res: Response) =>
  res.status(404).json({ success: false, message: "Contribution not found." });

export async function listContributions(
  req: Request<Record<string, never>, unknown, unknown, AdminContributionListQuery>,
  res: Response,
) {
  try {
    const contributions = await listAdminContributions(req.query.status);
    return res.status(200).json({ success: true, data: contributions });
  } catch (error) {
    console.error("Failed to list admin contributions.", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load contributions right now.",
    });
  }
}

export async function getContribution(
  req: Request<ContributionIdParams>,
  res: Response,
) {
  try {
    const contribution = await findAdminContributionById(req.params.id);
    if (!contribution) return notFound(res);
    return res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    console.error(`Failed to fetch contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the requested contribution right now.",
    });
  }
}

export async function updateContribution(
  req: Request<ContributionIdParams, unknown, UpdateContributionInput>,
  res: Response,
) {
  try {
    const contribution = await updateContributionRecord(
      req.params.id,
      req.body,
    );
    if (!contribution) return notFound(res);
    return res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    console.error(`Failed to update contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to update the contribution right now.",
    });
  }
}

export async function publishContribution(
  req: Request<ContributionIdParams, unknown, PublishContributionInput>,
  res: Response,
) {
  try {
    const contribution = await publishContributionRecord(
      req.params.id,
      req.body,
    );
    if (!contribution) return notFound(res);
    return res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    console.error(`Failed to publish contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to publish the contribution right now.",
    });
  }
}

export async function unpublishContribution(
  req: Request<ContributionIdParams>,
  res: Response,
) {
  try {
    const contribution = await unpublishContributionRecord(req.params.id);
    if (!contribution) return notFound(res);
    return res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    console.error(`Failed to unpublish contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to unpublish the contribution right now.",
    });
  }
}

export async function rejectContribution(
  req: Request<ContributionIdParams>,
  res: Response,
) {
  try {
    const contribution = await rejectContributionRecord(req.params.id);
    if (!contribution) return notFound(res);
    return res.status(200).json({ success: true, data: contribution });
  } catch (error) {
    console.error(`Failed to reject contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to reject the contribution right now.",
    });
  }
}

export async function deleteContribution(
  req: Request<ContributionIdParams>,
  res: Response,
) {
  try {
    const contribution = await deleteContributionRecord(req.params.id);
    if (!contribution) return notFound(res);
    return res.status(200).json({
      success: true,
      message: "Contribution deleted.",
      data: contribution,
    });
  } catch (error) {
    console.error(`Failed to delete contribution "${req.params.id}".`, error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the contribution right now.",
    });
  }
}
