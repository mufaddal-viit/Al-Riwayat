import { Prisma } from "@prisma/client";

import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import * as mockRepo from "./contributions.repo.mock";

const useMockBackend = () => env.DATA_BACKEND !== "prisma";

const publicContributionSelect = {
  id: true,
  title: true,
  slug: true,
  author: true,
  category: true,
  publishedAt: true,
  excerpt: true,
  body: true,
  coverImageUrl: true,
  coverImageAlt: true,
  featured: true,
} satisfies Prisma.ContributionSelect;

type PublicContributionRecord = Prisma.ContributionGetPayload<{
  select: typeof publicContributionSelect;
}>;

function serializePublicContribution(contribution: PublicContributionRecord) {
  return {
    id: contribution.id,
    title: contribution.title,
    slug: contribution.slug,
    author: contribution.author,
    category: contribution.category,
    publishedAt: contribution.publishedAt.toISOString(),
    excerpt: contribution.excerpt,
    body: contribution.body,
    coverImageUrl: contribution.coverImageUrl ?? undefined,
    coverImageAlt: contribution.coverImageAlt ?? undefined,
    featured: contribution.featured,
  };
}

export async function listPublishedContributions() {
  if (useMockBackend()) {
    return mockRepo.listPublishedContributions();
  }

  const contributions = await prisma.contribution.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: publicContributionSelect,
  });

  return contributions.map(serializePublicContribution);
}

export async function findPublishedContributionBySlug(slug: string) {
  if (useMockBackend()) {
    return mockRepo.findPublishedContributionBySlug(slug);
  }

  const contribution = await prisma.contribution.findFirst({
    where: { AND: [{ slug }, { status: "published" }] },
    select: publicContributionSelect,
  });

  if (!contribution) {
    return null;
  }

  return serializePublicContribution(contribution);
}
