import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSource = "body" | "query" | "params";

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
        errors: result.error.flatten().fieldErrors
      });
    }

    const mutableRequest = req as Request & Record<ValidationSource, unknown>;
    mutableRequest[source] = result.data;
    next();
  };
}
