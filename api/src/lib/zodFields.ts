import { z } from "zod";

/**
 * Optional URL field for admin-entered links.
 *
 * Order matters here. The naive `z.string().url().optional().or(z.literal(""))`
 * puts the strict URL check on the *left* of the union, so an empty string or a
 * scheme-less host reports that branch's failure ("Must be a valid URL.") before
 * the permissive branch is ever tried. Instead we normalize first and validate
 * last: blanks become "", and a bare "instagram.com/x" is upgraded to https://
 * rather than rejected — admins routinely paste links without the scheme.
 */
export const optionalUrl = (max = 600) =>
  z
    .string()
    .trim()
    .transform((value) => {
      if (!value) return "";
      // Already carries a scheme (http, https, mailto, tel, …) — leave it alone.
      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
      return `https://${value}`;
    })
    .pipe(
      z.literal("").or(
        z.string().url("Must be a valid URL.").max(max, `Must be ${max} characters or fewer.`),
      ),
    )
    .optional()
    .default("");

/** Optional email field. Blank is allowed; anything non-blank must be valid. */
export const optionalEmail = (max = 200) =>
  z
    .string()
    .trim()
    .pipe(
      z.literal("").or(
        z.string().email("Must be a valid email.").max(max, `Must be ${max} characters or fewer.`),
      ),
    )
    .optional()
    .default("");

/** Optional free text, trimmed, capped, defaulting to "". */
export const optionalText = (max = 300) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer.`).optional().default("");
