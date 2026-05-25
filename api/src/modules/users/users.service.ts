import type { Role } from "@prisma/client";

import { AppError } from "../../lib/AppError";
import { prisma } from "../../lib/prisma";
import { revokeAllUserTokens } from "../auth/token.service";
import type { SafeUser } from "../auth/auth.service";
import type { AdminUpdateUserInput, ListUsersQuery } from "../auth/auth.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginatedUsers {
  data: SafeUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSafeUser(user: { passwordHash: string; [key: string]: unknown }): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = user;
  return safe as SafeUser;
}

// ─── List Users ───────────────────────────────────────────────────────────────

export async function listUsers(query: ListUsersQuery): Promise<PaginatedUsers> {
  const { page, limit, role, isActive, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(role !== undefined && { role: role as Role }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    data: users as SafeUser[],
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get User By ID ───────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  return user as SafeUser;
}

// ─── Update User (Admin) ──────────────────────────────────────────────────────

export async function adminUpdateUser(
  id: string,
  input: AdminUpdateUserInput,
  requestingAdminId: string,
): Promise<SafeUser> {
  // Prevent an admin from demoting themselves
  if (id === requestingAdminId && input.role && input.role !== "ADMIN") {
    throw new AppError("You cannot change your own role.", 400, "SELF_ROLE_CHANGE");
  }

  // Prevent an admin from deactivating themselves
  if (id === requestingAdminId && input.isActive === false) {
    throw new AppError("You cannot deactivate your own account.", 400, "SELF_DEACTIVATE");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

  const user = await prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // If the user was deactivated, revoke all their sessions immediately
  if (input.isActive === false) {
    await revokeAllUserTokens(id);
  }

  return user as SafeUser;
}

// ─── Delete User (Admin) ──────────────────────────────────────────────────────

export async function adminDeleteUser(
  id: string,
  requestingAdminId: string,
): Promise<void> {
  if (id === requestingAdminId) {
    throw new AppError("You cannot delete your own admin account.", 400, "SELF_DELETE");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

  // Revoke all sessions before hard-deleting
  await revokeAllUserTokens(id);
  await prisma.user.delete({ where: { id } });
}
