import { Router } from "express";

import { requireDashboardSecret } from "../../middleware/requireDashboardSecret";
import { getDashboard } from "./admin-dashboard.controller";

const router = Router();

router.use(requireDashboardSecret);
router.get("/", getDashboard);

export default router;
