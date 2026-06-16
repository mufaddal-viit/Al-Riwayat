import mockRaw from "../../data/mock-contributions.json";

interface MockContribution {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const mock = mockRaw as MockContribution[];

function toPublicSummary(c: MockContribution) {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    author: c.author,
    category: c.category,
    publishedAt: c.publishedAt,
    excerpt: c.excerpt,
    coverImageUrl: c.coverImageUrl ?? undefined,
    coverImageAlt: c.coverImageAlt ?? undefined,
    featured: c.featured,
  };
}

function toPublicDetail(c: MockContribution) {
  return { ...toPublicSummary(c), body: c.body };
}

function byPublishedDesc(a: MockContribution, b: MockContribution) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function listPublishedContributions() {
  return mock
    .filter((c) => c.status === "published")
    .sort(byPublishedDesc)
    .map(toPublicDetail);
}

export function findPublishedContributionBySlug(slug: string) {
  const match = mock.find(
    (c) => c.status === "published" && c.slug === slug,
  );
  return match ? toPublicDetail(match) : null;
}
