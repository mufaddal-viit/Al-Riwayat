import type { Request, Response, NextFunction } from "express";

import * as usersService from "./users.service";
import type { AdminUpdateUserInput, ListUsersQuery } from "../auth/auth.schema";

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // req.query is validated and coerced by the validate middleware before this handler runs
    const result = await usersService.listUsers(req.query as unknown as ListUsersQuery);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request<{ id: string }, unknown, AdminUpdateUserInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await usersService.adminUpdateUser(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await usersService.adminDeleteUser(req.params.id, req.user!.sub);
    res.status(200).json({ success: true, message: "User deleted." });
  } catch (err) {
    next(err);
  }
}
