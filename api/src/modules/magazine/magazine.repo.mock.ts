import mockRaw from "../../data/mock-magazines.json";

import type { MagazineSearchQuery } from "./magazine.schema";

interface MockMagazine {
  id: string;
  title: string;
  issueNumber: number;
  slug: string;
  publishedAt: string;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
  flipbookUrl: string;
  author: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const mock = mockRaw as MockMagazine[];

function toPublicSummary(m: MockMagazine) {
  return {
    title: m.title,
    issueNumber: m.issueNumber,
    slug: m.slug,
    publishedAt: m.publishedAt,
    summary: m.summary,
    coverImageUrl: m.coverImageUrl,
    coverImageAlt: m.coverImageAlt,
    author: m.author,
  };
}

function toPublicDetail(m: MockMagazine) {
  return { ...toPublicSummary(m), flipbookUrl: m.flipbookUrl };
}

function byPublishedDesc(a: MockMagazine, b: MockMagazine) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function listPublishedIssues() {
  return mock
    .filter((m) => m.status === "published")
    .sort(byPublishedDesc)
    .map(toPublicSummary);
}

export function findPublishedIssueById(id: string) {
  const match = mock.find(
    (m) => m.status === "published" && (m.slug === id || m.id === id),
  );
  return match ? toPublicDetail(match) : null;
}

export function searchPublishedIssues(query: MagazineSearchQuery) {
  const q = query.q.toLowerCase();
  return mock
    .filter((m) => m.status === "published")
    .filter((m) =>
      [m.title, m.summary, m.author].some((v) => v.toLowerCase().includes(q)),
    )
    .sort(byPublishedDesc)
    .slice(0, query.limit)
    .map(toPublicSummary);
}
