import { Router } from "express";

import { getIssue } from "../controllers/magazine.controller";

const router = Router();

router.get("/issue/:id", getIssue);

export default router;
