import { Prisma, Status } from "@prisma/client";
import sanitizeHtml from "sanitize-html";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { env } from "../../lib/env";
import type { CreateCommentInput } from "./comments.schema";
import * as firestoreRepo from "./comments.repo.firestore";

const useFirestoreBackend = () => env.DATA_BACKEND === "firestore";

// ─── Mock data (MOCK_DB=true) ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockComments = require("../../data/mock-comments.json") as Array<{
  id: string;
  body: string;
  authorName: string;
  pageSlug: string;
  parentId: string | null;
  createdAt: string;
  replies?: unknown[];
}>;

// ─── Sanitize config ──────────────────────────────────────────────────────────

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li"],
  allowedAttributes: {},
};

// ─── Projection — never expose authorEmail to the public ─────────────────────

const publicCommentSelect = {
  id: true,
  body: true,
  authorName: true,
  pageSlug: true,
  parentId: true,
  status: true,
  createdAt: true,
} satisfies Prisma.CommentSelect;

const publicCommentWithRepliesSelect = {
  ...publicCommentSelect,
  replies: {
    where: { status: Status.APPROVED },
    select: publicCommentSelect,
    orderBy: { createdAt: Prisma.SortOrder.asc },
  },
} satisfies Prisma.CommentSelect;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handlePrismaNotFound(error: unknown, id: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new AppError(`Comment not found: ${id}`, 404, "COMMENT_NOT_FOUND");
  }
  throw error;
}

// ─── Author from auth ────────────────────────────────────────────────────────

export interface CommentAuthor {
  uid: string;
  email: string;
  name: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Fetch all approved top-level comments for a page slug,
 * with their approved replies nested in each comment.
 */
export async function getApprovedComments(slug: string) {
  if (useFirestoreBackend()) {
    return firestoreRepo.getApprovedComments(slug);
  }

  if (env.MOCK_DB) {
    const topLevel = mockComments.filter(
      (c) => c.pageSlug === slug && c.parentId === null,
    );
    return topLevel.map((c) => ({
      ...c,
      replies: mockComments.filter((r) => r.parentId === c.id),
    }));
  }

  return prisma.comment.findMany({
    where: {
      pageSlug: slug,
      status: Status.APPROVED,
      parentId: null, // top-level only — replies come via nested select
    },
    select: publicCommentWithRepliesSelect,
    orderBy: { createdAt: Prisma.SortOrder.desc },
  });
}

/**
 * Create a new comment.
 * - Author info is sourced from the authenticated session, not the request body.
 * - Firestore backend: auto-APPROVED (no moderation UI in no-DB mode).
 * - Prisma backend: lands in PENDING as before.
 */
export async function createComment(
  data: CreateCommentInput,
  author: CommentAuthor,
) {
  const sanitizedBody = sanitizeHtml(data.body.trim(), SANITIZE_OPTIONS);

  if (!sanitizedBody) {
    throw new AppError(
      "Comment body is empty after sanitization.",
      422,
      "EMPTY_BODY",
    );
  }

  if (useFirestoreBackend()) {
    return firestoreRepo.createComment({
      body: sanitizedBody,
      authorName: author.name,
      authorEmail: author.email,
      authorUid: author.uid,
      pageSlug: data.pageSlug,
      parentId: data.parentId ?? null,
      status: "APPROVED",
    });
  }

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { id: true, parentId: true },
    });

    if (!parent) {
      throw new AppError("Parent comment not found.", 404, "PARENT_NOT_FOUND");
    }

    if (parent.parentId !== null) {
      throw new AppError(
        "Replies to replies are not supported.",
        422,
        "NESTED_REPLY_NOT_ALLOWED",
      );
    }
  }

  return prisma.comment.create({
    data: {
      body: sanitizedBody,
      authorName: author.name,
      authorEmail: author.email,
      pageSlug: data.pageSlug,
      parentId: data.parentId ?? null,
      status: Status.PENDING,
    },
    select: publicCommentSelect,
  });
}

/**
 * Approve a comment by setting its status to APPROVED.
 * Admin-only operation.
 */
export async function approveComment(id: string) {
  try {
    return await prisma.comment.update({
      where: { id },
      data: { status: Status.APPROVED },
      select: { id: true, status: true, authorName: true, pageSlug: true },
    });
  } catch (error) {
    handlePrismaNotFound(error, id);
  }
}

/**
 * Mark a comment as SPAM.
 */
export async function markAsSpam(id: string) {
  try {
    return await prisma.comment.update({
      where: { id },
      data: { status: Status.SPAM },
      select: { id: true, status: true, authorName: true, pageSlug: true },
    });
  } catch (error) {
    handlePrismaNotFound(error, id);
  }
}

/**
 * Hard-delete a comment.
 */
export async function deleteComment(id: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!comment) {
    throw new AppError(`Comment not found: ${id}`, 404, "COMMENT_NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { parentId: id } }),
    prisma.comment.delete({ where: { id } }),
  ]);

  return { id };
}
