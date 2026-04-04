const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const outputFile = "./src/docs/magazine.swagger-output.json";
const endpointsFiles = ["./src/docs/magazine.swagger-routes.ts"];

const doc = {
  info: {
    title: "Magazine API Docs",
    description:
      "Interactive Swagger documentation for the magazine reader and admin endpoints.",
  },
  servers: [
    {
      url: "/",
      description: "Same-origin API server",
    },
  ],
  tags: [
    {
      name: "Magazine Reader",
      description: "Public, read-only magazine endpoints.",
    },
    {
      name: "Magazine Admin",
      description: "Editorial management endpoints for magazine issues.",
    },
  ],
  definitions: {
    MagazineIssueSummary: {
      title: "The Quiet Return Of Intentional Reading",
      issueNumber: 1,
      slug: "issue-1",
      publishedAt: "2026-01-15T09:00:00.000Z",
      summary:
        "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
      coverImageUrl: "/images/hero/home-hero.webp",
      coverImageAlt:
        "Issue 1 cover image framed as a premium editorial magazine cover.",
      author: "Editorial Desk",
    },
    MagazineIssueDetail: {
      title: "The Quiet Return Of Intentional Reading",
      issueNumber: 1,
      slug: "issue-1",
      publishedAt: "2026-01-15T09:00:00.000Z",
      summary:
        "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
      coverImageUrl: "/images/hero/home-hero.webp",
      coverImageAlt:
        "Issue 1 cover image framed as a premium editorial magazine cover.",
      author: "Editorial Desk",
      flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
    },
    AdminMagazineIssue: {
      title: "The Quiet Return Of Intentional Reading",
      issueNumber: 1,
      slug: "issue-1",
      publishedAt: "2026-01-15T09:00:00.000Z",
      summary:
        "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
      coverImageUrl: "/images/hero/home-hero.webp",
      coverImageAlt:
        "Issue 1 cover image framed as a premium editorial magazine cover.",
      author: "Editorial Desk",
      flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
      status: "published",
      createdAt: "2026-01-10T09:00:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
    },
    CreateMagazineRequest: {
      title: "The Quiet Return Of Intentional Reading",
      issueNumber: 1,
      slug: "issue-1",
      publishedAt: "2026-01-15T09:00:00.000Z",
      summary:
        "A long-form editorial opening on why better digital magazines are built through pacing, restraint, and attention-friendly design.",
      coverImageUrl: "/images/hero/home-hero.webp",
      coverImageAlt:
        "Issue 1 cover image framed as a premium editorial magazine cover.",
      flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
      author: "Editorial Desk",
    },
    UpdateMagazineRequest: {
      summary:
        "An updated issue summary tuned for clarity after editorial review.",
      flipbookUrl: "https://heyzine.com/flip-book/7447c8853d.html",
    },
    DeleteMagazineResponse: {
      success: true,
      message: "Issue deleted.",
      issue: {
        $ref: "#/definitions/AdminMagazineIssue",
      },
    },
    ErrorResponse: {
      success: false,
      message: "Issue not found.",
    },
    ValidationErrorResponse: {
      success: false,
      message: "Invalid request body.",
      errors: {
        title: ["Title must be at least 3 characters long."],
      },
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
