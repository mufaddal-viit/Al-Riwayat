import { Prisma } from "@prisma/client";
import { env } from "../../lib/env";
import mockRaw from "../../data/mock-magazines.json";
// console.log(mockRaw);
import { prisma } from "../../lib/prisma";
import type {
  AdminMagazineListQuery,
  CreateMagazineInput,
  MagazineSearchQuery,
  ReplaceMagazineInput,
  UpdateMagazineInput,
} from "./magazine.schema";

const publicIssueSummarySelect = {
  title: true,
  issueNumber: true,
  slug: true,
  publishedAt: true,
  summary: true,
  coverImageUrl: true,
  coverImageAlt: true,
  author: true,
} satisfies Prisma.MagazineSelect;

const publicIssueDetailSelect = {
  ...publicIssueSummarySelect,
  flipbookUrl: true,
} satisfies Prisma.MagazineSelect;

const adminIssueSummarySelect = {
  ...publicIssueSummarySelect,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MagazineSelect;

const adminIssueDetailSelect = {
  ...adminIssueSummarySelect,
  flipbookUrl: true,
} satisfies Prisma.MagazineSelect;

type PublicIssueSummaryRecord = Prisma.MagazineGetPayload<{
  select: typeof publicIssueSummarySelect;
}>;

type PublicIssueDetailRecord = Prisma.MagazineGetPayload<{
  select: typeof publicIssueDetailSelect;
}>;

type AdminIssueSummaryRecord = Prisma.MagazineGetPayload<{
  select: typeof adminIssueSummarySelect;
}>;

type AdminIssueDetailRecord = Prisma.MagazineGetPayload<{
  select: typeof adminIssueDetailSelect;
}>;

function issueIdentifierWhere(id: string): Prisma.MagazineWhereInput {
  return {
    OR: [{ slug: id }, { id }],
  };
}

function serializePublicIssueSummary(issue: PublicIssueSummaryRecord) {
  return {
    title: issue.title,
    issueNumber: issue.issueNumber,
    slug: issue.slug,
    publishedAt: issue.publishedAt.toISOString(),
    summary: issue.summary,
    coverImageUrl: issue.coverImageUrl,
    coverImageAlt: issue.coverImageAlt,
    author: issue.author,
  };
}

function serializePublicIssueDetail(issue: PublicIssueDetailRecord) {
  return {
    ...serializePublicIssueSummary(issue),
    flipbookUrl: issue.flipbookUrl,
  };
}

function serializeAdminIssueSummary(issue: AdminIssueSummaryRecord) {
  return {
    ...serializePublicIssueSummary(issue),
    status: issue.status,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  };
}

function serializeAdminIssueDetail(issue: AdminIssueDetailRecord) {
  return {
    ...serializeAdminIssueSummary(issue),
    flipbookUrl: issue.flipbookUrl,
  };
}

async function resolveIssueIdentity(id: string) {
  return prisma.magazine.findFirst({
    where: issueIdentifierWhere(id),
    select: { id: true },
  });
}

function buildMagazineCreateData(
  input: CreateMagazineInput,
): Prisma.MagazineCreateInput {
  return {
    title: input.title,
    issueNumber: input.issueNumber,
    slug: input.slug,
    publishedAt: input.publishedAt,
    summary: input.summary,
    coverImageUrl: input.coverImageUrl,
    coverImageAlt: input.coverImageAlt,
    flipbookUrl: input.flipbookUrl,
    author: input.author,
    status: "draft",
  };
}

function buildMagazineUpdateData(
  input: UpdateMagazineInput | ReplaceMagazineInput,
): Prisma.MagazineUpdateInput {
  const data: Prisma.MagazineUpdateInput = {};

  if (input.title !== undefined) {
    data.title = input.title;
  }

  if (input.issueNumber !== undefined) {
    data.issueNumber = input.issueNumber;
  }

  if (input.slug !== undefined) {
    data.slug = input.slug;
  }

  if (input.publishedAt !== undefined) {
    data.publishedAt = input.publishedAt;
  }

  if (input.summary !== undefined) {
    data.summary = input.summary;
  }

  if (input.coverImageUrl !== undefined) {
    data.coverImageUrl = input.coverImageUrl;
  }

  if (input.coverImageAlt !== undefined) {
    data.coverImageAlt = input.coverImageAlt;
  }

  if (input.flipbookUrl !== undefined) {
    data.flipbookUrl = input.flipbookUrl;
  }

  if (input.author !== undefined) {
    data.author = input.author;
  }

  return data;
}

async function createDuplicateSlug(baseSlug: string) {
  const seedSlug = `${baseSlug}-copy`;
  let candidate = seedSlug;
  let suffix = 2;

  while (
    await prisma.magazine.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${seedSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function listPublishedIssues() {
  const issues = await prisma.magazine.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: publicIssueSummarySelect,
  });

  return issues.map(serializePublicIssueSummary);
}

export async function findPublishedIssueById(id: string) {
  const issue = await prisma.magazine.findFirst({
    where: {
      AND: [issueIdentifierWhere(id), { status: "published" }],
    },
    select: publicIssueDetailSelect,
  });

  if (!issue) {
    return null;
  }

  return serializePublicIssueDetail(issue);
}

export async function findPublishedIssues() {
  if (env.MOCK_DB) {
    const mockData = mockRaw as any[];
    const published = mockData
      .filter((i: any) => i.status === "published")
      .sort(
        (a: any, b: any) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .map((latest: any) => ({
        title: latest.title,
        issueNumber: latest.issueNumber,
        slug: latest.slug,
        publishedAt: new Date(latest.publishedAt),
        summary: latest.summary,
        coverImageUrl: latest.coverImageUrl,
        coverImageAlt: latest.coverImageAlt,
        author: latest.author,
      }));

    return published.map((issue: any) => serializePublicIssueSummary(issue));
  }

  const issues = await prisma.magazine.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: publicIssueSummarySelect,
  });

  return issues.map(serializePublicIssueSummary);
}

export async function searchPublishedIssues(query: MagazineSearchQuery) {
  const issues = await prisma.magazine.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: publicIssueSummarySelect,
  });

  const normalizedQuery = query.q.toLowerCase();

  return issues
    .filter((issue) =>
      [issue.title, issue.summary, issue.author].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
    .slice(0, query.limit)
    .map(serializePublicIssueSummary);
}

export async function listAdminIssues(query: AdminMagazineListQuery) {
  const issues = await prisma.magazine.findMany({
    where: query.status ? { status: query.status } : undefined,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: adminIssueSummarySelect,
  });

  return issues.map(serializeAdminIssueSummary);
}

export async function findAdminIssueById(id: string) {
  const issue = await prisma.magazine.findFirst({
    where: issueIdentifierWhere(id),
    select: adminIssueDetailSelect,
  });

  if (!issue) {
    return null;
  }

  return serializeAdminIssueDetail(issue);
}

export async function createIssue(input: CreateMagazineInput) {
  const issue = await prisma.magazine.create({
    data: buildMagazineCreateData(input),
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function patchIssue(id: string, input: UpdateMagazineInput) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.update({
    where: { id: existingIssue.id },
    data: buildMagazineUpdateData(input),
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function replaceIssue(id: string, input: ReplaceMagazineInput) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.update({
    where: { id: existingIssue.id },
    data: buildMagazineUpdateData(input),
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function deleteIssue(id: string) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.delete({
    where: { id: existingIssue.id },
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function publishIssue(id: string) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.update({
    where: { id: existingIssue.id },
    data: { status: "published" },
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function unpublishIssue(id: string) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.update({
    where: { id: existingIssue.id },
    data: { status: "draft" },
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function archiveIssue(id: string) {
  const existingIssue = await resolveIssueIdentity(id);

  if (!existingIssue) {
    return null;
  }

  const issue = await prisma.magazine.update({
    where: { id: existingIssue.id },
    data: { status: "archived" },
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(issue);
}

export async function duplicateIssue(id: string) {
  const sourceIssue = await prisma.magazine.findFirst({
    where: issueIdentifierWhere(id),
    select: adminIssueDetailSelect,
  });

  if (!sourceIssue) {
    return null;
  }

  const duplicateSlug = await createDuplicateSlug(sourceIssue.slug);

  const duplicate = await prisma.magazine.create({
    data: {
      title: `${sourceIssue.title} (Copy)`,
      issueNumber: sourceIssue.issueNumber,
      slug: duplicateSlug,
      publishedAt: sourceIssue.publishedAt,
      summary: sourceIssue.summary,
      coverImageUrl: sourceIssue.coverImageUrl,
      coverImageAlt: sourceIssue.coverImageAlt,
      flipbookUrl: sourceIssue.flipbookUrl,
      author: sourceIssue.author,
      status: "draft",
    },
    select: adminIssueDetailSelect,
  });

  return serializeAdminIssueDetail(duplicate);
}
