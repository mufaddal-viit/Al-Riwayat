import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";

import type {
  AdminMagazineListQuery,
  CreateMagazineInput,
  MagazineIdParams,
  ReplaceMagazineInput,
  UpdateMagazineInput,
} from "./magazine.schema";
import {
  archiveIssue as archiveMagazineIssue,
  createIssue as createMagazineIssue,
  deleteIssue as deleteMagazineIssue,
  duplicateIssue as duplicateMagazineIssue,
  findAdminIssueById,
  listAdminIssues,
  patchIssue as patchMagazineIssue,
  publishIssue as publishMagazineIssue,
  replaceIssue as replaceMagazineIssue,
  unpublishIssue as unpublishMagazineIssue,
} from "./magazine.service";

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function createIssue(
  req: Request<Record<string, never>, unknown, CreateMagazineInput>,
  res: Response
) {
  try {
    const issue = await createMagazineIssue(req.body);

    return res.status(201).json(issue);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        message: "An issue with that slug already exists.",
      });
    }

    console.error("Failed to create issue.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the issue right now.",
    });
  }
}

export async function listIssues(
  req: Request<Record<string, never>, unknown, unknown, AdminMagazineListQuery>,
  res: Response
) {
  try {
    const issues = await listAdminIssues(req.query);

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Failed to list admin issues.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load issues right now.",
    });
  }
}

export async function getIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await findAdminIssueById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to fetch admin issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the requested issue right now.",
    });
  }
}

export async function patchIssue(
  req: Request<MagazineIdParams, unknown, UpdateMagazineInput>,
  res: Response
) {
  try {
    const issue = await patchMagazineIssue(req.params.id, req.body);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        message: "An issue with that slug already exists.",
      });
    }

    console.error(`Failed to update issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to update the issue right now.",
    });
  }
}

export async function replaceIssue(
  req: Request<MagazineIdParams, unknown, ReplaceMagazineInput>,
  res: Response
) {
  try {
    const issue = await replaceMagazineIssue(req.params.id, req.body);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        message: "An issue with that slug already exists.",
      });
    }

    console.error(`Failed to replace issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to replace the issue right now.",
    });
  }
}

export async function deleteIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await deleteMagazineIssue(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted.",
      issue,
    });
  } catch (error) {
    console.error(`Failed to delete issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the issue right now.",
    });
  }
}

export async function publishIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await publishMagazineIssue(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to publish issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to publish the issue right now.",
    });
  }
}

export async function unpublishIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await unpublishMagazineIssue(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to unpublish issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to unpublish the issue right now.",
    });
  }
}

export async function archiveIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await archiveMagazineIssue(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(200).json(issue);
  } catch (error) {
    console.error(`Failed to archive issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to archive the issue right now.",
    });
  }
}

export async function duplicateIssue(
  req: Request<MagazineIdParams>,
  res: Response
) {
  try {
    const issue = await duplicateMagazineIssue(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found.",
      });
    }

    return res.status(201).json(issue);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        success: false,
        message: "A duplicate issue slug could not be generated safely.",
      });
    }

    console.error(`Failed to duplicate issue "${req.params.id}".`, error);

    return res.status(500).json({
      success: false,
      message: "Unable to duplicate the issue right now.",
    });
  }
}
