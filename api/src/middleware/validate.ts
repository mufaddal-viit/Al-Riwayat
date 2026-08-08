import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

type ValidationSource = "body" | "query" | "params";

/**
 * Group Zod issues by their dotted path. `error.flatten().fieldErrors` only
 * reports the first path segment, so a bad `links.website` surfaced as
 * `{ links: ["Must be a valid URL."] }` — enough to fail, not enough to fix.
 */
function fieldErrorsByPath(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    (errors[key] ??= []).push(issue.message);
  }

  return errors;
}

export function validate(
  schema: ZodTypeAny,
  source: ValidationSource = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: `Invalid request ${source}.`,
        // Keyed by full dotted path ("links.website") rather than flatten()'s
        // top-level-only key, so a nested failure points at the real field.
        errors: fieldErrorsByPath(result.error)
      });
    }

    const mutableRequest = req as Request & Record<ValidationSource, unknown>;
    mutableRequest[source] = result.data;
    next();
  };
}
