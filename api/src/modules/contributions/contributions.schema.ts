import { z } from "zod";

import { contributionCategories } from "./contributions.types";

export const contributionIdParamsSchema = z.object({
  slug: z.string().trim().min(1, "Contribution slug is required."),
});

export const contributionCategorySchema = z.enum(contributionCategories);

export type ContributionIdParams = z.infer<typeof contributionIdParamsSchema>;
