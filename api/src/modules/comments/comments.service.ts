import { prisma } from "../../lib/prisma";
import sanitizeHtml from "sanitize-html";
import type { CreateCommentInput, CommentParamInput } from "./comments.schema";
import type { Status } from "@prisma/client";

export async function getApprovedComments(slug: string) {
  // mock data - uncomment DB above for live
  const mockData = require("../../data/mock-comments.json");
  const pageComments = mockData.filter((c: any) => c.pageSlug === slug);
  return pageComments.map((c: any) => ({
    ...c,
    replies: mockData.filter((r: any) => r.parentId === c.id),
  }));
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

//
// import { prisma } from "../../lib/prisma";
// import sanitizeHtml from "sanitize-html";
// import { Prisma, Status } from "@prisma/client";
// import type { CreateCommentInput } from "./comments.schema";

// // ─────────────────────────────────────────────
// // Custom error classes for clean error handling
// // ─────────────────────────────────────────────

// export class CommentNotFoundError extends Error {
//   constructor(id: string) {
//     super(`Comment not found: ${id}`);
//     this.name = "CommentNotFoundError";
//   }
// }

// export class ParentCommentNotFoundError extends Error {
//   constructor(id: string) {
//     super(`Parent comment not found: ${id}`);
//     this.name = "ParentCommentNotFoundError";
//   }
// }

// // ─────────────────────────────────────────────
// // Sanitize config — reused across functions
// // ─────────────────────────────────────────────

// const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
//   allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
//   allowedAttributes: {},
// };

// // ─────────────────────────────────────────────
// // Shape returned to client — never expose email
// // ─────────────────────────────────────────────

// const commentSelect = {
//   id: true,
//   body: true,
//   authorName: true,
//   pageSlug: true,
//   parentId: true,
//   status: true,
//   createdAt: true,
//   replies: {
//     where: { status: Status.APPROVED },
//     select: {
//       id: true,
//       body: true,
//       authorName: true,
//       pageSlug: true,
//       parentId: true,
//       status: true,
//       createdAt: true,
//     },
//     orderBy: { createdAt: Prisma.SortOrder.asc },
//   },
// } satisfies Prisma.CommentSelect;

// // ─────────────────────────────────────────────
// // Service functions
// // ─────────────────────────────────────────────

// /**
//  * Fetch all approved top-level comments for a given page slug,
//  * with their approved replies nested inside.
//  */
// export async function getApprovedComments(slug: string) {
//   return prisma.comment.findMany({
//     where: {
//       pageSlug: slug,
//       status: Status.APPROVED,
//       parentId: null,           // top-level only — replies come via select
//     },
//     select: commentSelect,
//     orderBy: { createdAt: Prisma.SortOrder.desc },
//   });
// }

// /**
//  * Create a new comment with PENDING status.
//  * Validates parent exists if parentId is provided.
//  * Sanitizes body before saving.
//  */
// export async function createComment(data: CreateCommentInput) {
//   if (data.parentId) {
//     const parent = await prisma.comment.findUnique({
//       where: { id: data.parentId },
//       select: { id: true },     // only fetch what we need
//     });

//     if (!parent) {
//       throw new ParentCommentNotFoundError(data.parentId);
//     }
//   }

//   const sanitizedBody = sanitizeHtml(data.body, SANITIZE_OPTIONS);

//   if (!sanitizedBody.trim()) {
//     throw new Error("Comment body is empty after sanitization.");
//   }

//   return prisma.comment.create({
//     data: {
//       body: sanitizedBody,
//       authorName: data.authorName,
//       authorEmail: data.authorEmail,
//       pageSlug: data.pageSlug,
//       parentId: data.parentId ?? null,
//       status: Status.PENDING,
//     },
//     select: {
//       id: true,
//       body: true,
//       authorName: true,
//       pageSlug: true,
//       parentId: true,
//       status: true,
//       createdAt: true,
//     },
//   });
// }

// /**
//  * Approve a comment by setting its status to APPROVED.
//  * Throws if comment does not exist.
//  */
// export async function approveComment(id: string) {
//   try {
//     return await prisma.comment.update({
//       where: { id },
//       data: { status: Status.APPROVED },
//       select: { id: true, status: true },
//     });
//   } catch (error) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2025"              // prisma's "record not found" code
//     ) {
//       throw new CommentNotFoundError(id);
//     }
//     throw error;                          // rethrow anything unexpected
//   }
// }

// /**
//  * Hard delete a comment and all its replies (cascade).
//  * Throws if comment does not exist.
//  */
// export async function deleteComment(id: string) {
//   try {
//     return await prisma.comment.delete({
//       where: { id },
//       select: { id: true },
//     });
//   } catch (error) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2025"
//     ) {
//       throw new CommentNotFoundError(id);
//     }
//     throw error;
//   }
// }

// /**
//  * Mark a comment as SPAM.
//  * Keeps the record for audit — use deleteComment to hard delete.
//  */
// export async function markAsSpam(id: string) {
//   try {
//     return await prisma.comment.update({
//       where: { id },
//       data: { status: Status.SPAM },
//       select: { id: true, status: true },
//     });
//   } catch (error) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2025"
//     ) {
//       throw new CommentNotFoundError(id);
//     }
//     throw error;
//   }
// }
