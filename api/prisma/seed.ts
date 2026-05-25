import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { issue1MagazineSeed } from "../src/modules/magazine/magazine.seed";

const prisma = new PrismaClient();

async function main() {
  // ─── Magazine Issue 1 ──────────────────────────────────────────────────────

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
      status: issue1MagazineSeed.status,
    },
    create: issue1MagazineSeed,
  });

  console.log("✓ Magazine Issue 1 seeded.");

  // ─── Default Admin User ────────────────────────────────────────────────────
  //
  // IMPORTANT: Change this password immediately after first login.
  // This account is the only way to access admin routes until you
  // implement a proper admin invite flow.
  //

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@alriwayat.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@1234!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // Never overwrite an existing admin — they may have changed their password
    create: {
      email: adminEmail,
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`✓ Admin user seeded: ${adminEmail}`);
  console.log("  ⚠  Change the default admin password immediately after first login.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
