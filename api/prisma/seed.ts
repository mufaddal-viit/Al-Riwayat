import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { issue1MagazineSeed } from "../src/modules/magazine/magazine.seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.magazine.upsert({
    where: { slug: issue1MagazineSeed.slug },
    update: {
      title: issue1MagazineSeed.title,
      issueNumber: issue1MagazineSeed.issueNumber,
      publishedAt: issue1MagazineSeed.publishedAt,
      summary: issue1MagazineSeed.summary,
      coverImageUrl: issue1MagazineSeed.coverImageUrl,
      coverImageAlt: issue1MagazineSeed.coverImageAlt,
      flipbookUrl: issue1MagazineSeed.flipbookUrl,
      author: issue1MagazineSeed.author,
      status: issue1MagazineSeed.status
    },
    create: issue1MagazineSeed
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed the database.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
