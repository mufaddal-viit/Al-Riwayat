import { prisma } from "../lib/prisma";

export async function findIssueById(id: string) {
  const issue = await prisma.magazine.findUnique({
    where: { slug: id },
    select: {
      title: true,
      issueNumber: true,
      slug: true,
      publishedAt: true,
      summary: true,
      coverImageUrl: true,
      coverImageAlt: true,
      flipbookUrl: true,
      author: true,
      body: true
    }
  });

  if (!issue) {
    return null;
  }

  return {
    title: issue.title,
    issueNumber: issue.issueNumber,
    slug: issue.slug,
    publishedAt: issue.publishedAt.toISOString(),
    summary: issue.summary,
    coverImageUrl: issue.coverImageUrl,
    coverImageAlt: issue.coverImageAlt,
    flipbookUrl: issue.flipbookUrl,
    author: issue.author,
    body: issue.body
  };
}
