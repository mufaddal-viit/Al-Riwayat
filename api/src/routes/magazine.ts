import { Router } from "express";

import { getIssueOne } from "../controllers/magazine.controller";

const router = Router();

router.get("/issue-1", getIssueOne);

export default router;
