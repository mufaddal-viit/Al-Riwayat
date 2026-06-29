import { z } from "zod";

export const SUBMISSION_TYPES = ["POEM", "STORY", "ART"] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

const optionalNumeric = z
  .union([z.string(), z.number(), z.undefined(), z.null()])
  .transform((value) => {
    if (value === undefined || value === null || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return null;
    return n;
  })
  .refine((value) => value === null || (value >= 5 && value <= 120), {
    message: "Age must be between 5 and 120.",
  });

const booleanString = z
  .union([z.string(), z.boolean()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    return value === "true" || value === "YES" || value === "yes";
  });

/**
 * Multipart text fields. Files are validated separately by multer (size + mime).
 * All values arrive as strings; coerce/parse here.
 */
export const submissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name must be 80 characters or fewer."),
  age: optionalNumeric,
  email: z.string().trim().email("Provide a valid email address."),
  submissionType: z.enum(SUBMISSION_TYPES, {
    errorMap: () => ({ message: "Select POEM, STORY, or ART." }),
  }),
  content: z
    .string()
    .trim()
    .min(1, "Your submission cannot be empty.")
    .max(20000, "Submission is too long."),
  // Contributions are always credited by name; kept optional for backward
  // compatibility with older clients but no longer surfaced anywhere.
  anonymous: booleanString.optional().default(false),
  honeypot: z.string().max(200).optional().default(""),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
