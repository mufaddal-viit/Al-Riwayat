import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { issue1MagazineSeed } from "../src/lib/issue1";

const prisma = new PrismaClient();

async function main() {
  await prisma.magazine.upsert({
    where: { slug: issue1MagazineSeed.slug },
    update: {
      title: issue1MagazineSeed.title,
      issueNumber: issue1MagazineSeed.issueNumber,
      publishedAt: issue1MagazineSeed.publishedAt,
      coverImageUrl: issue1MagazineSeed.coverImageUrl,
      author: issue1MagazineSeed.author,
      body: issue1MagazineSeed.body
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
