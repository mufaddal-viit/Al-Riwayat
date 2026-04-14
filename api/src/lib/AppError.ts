/**
 * Operational error with an explicit HTTP status code.
 * Throw this from services to communicate expected failure paths
 * (bad input, auth failures, not found, etc.).
 * The global error handler in app.ts forwards it as-is to the client.
 * Unexpected errors (DB crashes, unhandled exceptions) should NOT use this
 * class — those fall through to the generic 500 handler.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    /** Machine-readable code for the frontend to act on (e.g. TOKEN_EXPIRED) */
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
    // Maintain proper prototype chain in compiled JS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
