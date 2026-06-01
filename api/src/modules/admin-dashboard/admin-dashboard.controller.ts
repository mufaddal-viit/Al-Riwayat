import type { NextFunction, Request, Response } from "express";

import { getAdminDashboardData } from "./admin-dashboard.repo.firestore";

export async function getDashboard(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dashboard = await getAdminDashboardData();
    res.status(200).json({ success: true, data: dashboard });
  } catch (err) {
    next(err);
  }
}
