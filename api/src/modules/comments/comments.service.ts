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
  status: true,
  createdAt: true,
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

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Fetch all approved comments for a page slug.
 */
export async function getApprovedComments(slug: string) {
  if (useFirestoreBackend()) {
    return firestoreRepo.getApprovedComments(slug);
  }

  if (env.MOCK_DB) {
    return mockComments
      .filter((c) => c.pageSlug === slug && c.parentId === null)
      .map(({ parentId: _parentId, ...rest }) => rest);
  }

  return prisma.comment.findMany({
    where: {
      pageSlug: slug,
      status: Status.APPROVED,
      parentId: null,
    },
    select: publicCommentSelect,
    orderBy: { createdAt: Prisma.SortOrder.desc },
  });
}

/**
 * Create a new comment. Open to anyone — author info is in the request body.
 * - Firestore backend: auto-APPROVED (no moderation UI in no-DB mode).
 * - Prisma backend: lands in PENDING.
 */
export async function createComment(data: CreateCommentInput) {
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
      authorName: data.authorName,
      pageSlug: data.pageSlug,
      status: "APPROVED",
    });
  }

  return prisma.comment.create({
    data: {
      body: sanitizedBody,
      authorName: data.authorName,
      authorEmail: "",
      pageSlug: data.pageSlug,
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

  await prisma.comment.delete({ where: { id } });
  return { id };
}
