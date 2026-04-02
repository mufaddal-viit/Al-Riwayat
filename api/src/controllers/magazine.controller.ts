import type { Request, Response } from "express";

import { prisma } from "../lib/prisma";

export async function getIssueOne(_req: Request, res: Response) {
  try {
    const issue = await prisma.magazine.findUnique({
      where: { slug: "issue-1" },
      select: {
        title: true,
        issueNumber: true,
        publishedAt: true,
        coverImageUrl: true,
        author: true,
        body: true
      }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue 1 not found. Run `npm run db:seed` to load development content."
      });
    }

    return res.status(200).json({
      title: issue.title,
      issueNumber: issue.issueNumber,
      publishedAt: issue.publishedAt.toISOString(),
      coverImageUrl: issue.coverImageUrl,
      author: issue.author,
      body: issue.body
    });
  } catch (error) {
    console.error("Failed to fetch Issue 1.", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load Issue 1 right now."
    });
  }
}
