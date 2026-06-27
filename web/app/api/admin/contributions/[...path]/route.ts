import { proxyContributionRequest } from "../proxy";

export const runtime = "nodejs";

type Ctx = { params: { path: string[] } };

/** Allow-list the moderation actions the BFF will forward. */
const ALLOWED_ACTIONS = new Set(["publish", "unpublish", "reject"]);

function buildPath(segments: string[]): string | null {
  if (segments.length === 1) {
    // /:id  (PATCH update, DELETE)
    return `/${encodeURIComponent(segments[0])}`;
  }
  if (segments.length === 2 && ALLOWED_ACTIONS.has(segments[1])) {
    // /:id/:action
    return `/${encodeURIComponent(segments[0])}/${segments[1]}`;
  }
  return null;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const path = buildPath(params.path);
  if (!path) {
    return Response.json(
      { success: false, message: "Unknown moderation action." },
      { status: 404 },
    );
  }
  const body = await readJson(request);
  return proxyContributionRequest({ method: "PATCH", path, body });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (params.path.length !== 1) {
    return Response.json(
      { success: false, message: "Unknown moderation action." },
      { status: 404 },
    );
  }
  return proxyContributionRequest({
    method: "DELETE",
    path: `/${encodeURIComponent(params.path[0])}`,
  });
}
