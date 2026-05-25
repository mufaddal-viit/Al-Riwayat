import { Router } from "express";

import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import {
  getMe,
  updateMe,
  addBookmark,
  removeBookmark,
  addFavourite,
  removeFavourite,
} from "./me.controller";
import { slugParamSchema, updateMeSchema } from "./me.schema";

const router = Router();

router.use(requireAuth);

router.get("/", getMe);
router.patch("/", validate(updateMeSchema), updateMe);

router.post(
  "/bookmarks/:slug",
  validate(slugParamSchema, "params"),
  addBookmark,
);
router.delete(
  "/bookmarks/:slug",
  validate(slugParamSchema, "params"),
  removeBookmark,
);
router.post(
  "/favourites/:slug",
  validate(slugParamSchema, "params"),
  addFavourite,
);
router.delete(
  "/favourites/:slug",
  validate(slugParamSchema, "params"),
  removeFavourite,
);

export default router;
