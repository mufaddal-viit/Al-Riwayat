import { prisma } from "../../lib/prisma";
import sanitizeHtml from "sanitize-html";
import type { CreateCommentInput, CommentParamInput } from "./comments.schema";
import type { Status } from "@prisma/client";

export async function getApprovedComments(slug: string) {
  return prisma.comment.findMany({
    where: {
      pageSlug: slug,
      status: "APPROVED",
      parentId: null,
    },
    include: {
      replies: {
        where: { status: "APPROVED" },
        include: {
          replies: {
            where: { status: "APPROVED" },
            // limit depth if needed
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createComment(data: CreateCommentInput) {
  // validate parent exists if provided
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
    });
    if (!parent) {
      throw new Error("Parent comment not found.");
    }
  }

  const sanitizedBody = sanitizeHtml(data.body, {
    allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
    allowedAttributes: {},
  });

  return prisma.comment.create({
    data: {
      ...data,
      body: sanitizedBody,
      status: "PENDING" as Status,
    },
  });
}

export async function deleteComment(id: string) {
  return prisma.comment.deleteMany({
    where: {
      id,
      OR: [
        { status: "SPAM" },
        // admin check here later
      ],
    },
  });
}

export async function approveComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { status: "APPROVED" as Status },
  });
}
