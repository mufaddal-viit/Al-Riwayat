import { proxyDashboardRequest } from "@/lib/admin/bff-proxy";

export const runtime = "nodejs";

type Ctx = { params: { path: string[] } };

const KNOWN_RESOURCES = new Set([
  "comments",
  "contacts",
  "newsletter",
  "reactions",
  "engagement",
]);

function encodePath(segments: string[]): string {
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

function validResource(segments: string[]): boolean {
  return segments.length > 0 && KNOWN_RESOURCES.has(segments[0]);
}

/** GET /api/admin/collections/:resource — list records. */
export async function GET(request: Request, { params }: Ctx) {
  if (params.path.length !== 1 || !validResource(params.path)) {
    return Response.json(
      { success: false, message: "Unknown resource." },
      { status: 404 },
    );
  }
  const { search } = new URL(request.url);
  return proxyDashboardRequest({
    method: "GET",
    path: `/collections/${encodePath(params.path)}${search}`,
  });
}

/** PATCH /api/admin/collections/:resource/:id/:action — soft transition. */
export async function PATCH(_request: Request, { params }: Ctx) {
  if (params.path.length !== 3 || !validResource(params.path)) {
    return Response.json(
      { success: false, message: "Unknown moderation action." },
      { status: 404 },
    );
  }
  return proxyDashboardRequest({
    method: "PATCH",
    path: `/collections/${encodePath(params.path)}`,
  });
}

/** DELETE /api/admin/collections/:resource/:id — hard delete. */
export async function DELETE(_request: Request, { params }: Ctx) {
  if (params.path.length !== 2 || !validResource(params.path)) {
    return Response.json(
      { success: false, message: "Unknown resource." },
      { status: 404 },
    );
  }
  return proxyDashboardRequest({
    method: "DELETE",
    path: `/collections/${encodePath(params.path)}`,
  });
}
