import { proxyDashboardRequest } from "@/lib/admin/bff-proxy";

export const runtime = "nodejs";

type Ctx = { params: { path?: string[] } };

const LIFECYCLE_ACTIONS = new Set(["archive"]);

function encodePath(segments: string[]): string {
  return segments.map((s) => encodeURIComponent(s)).join("/");
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

/** GET /api/admin/clients  or  /api/admin/clients/:id */
export async function GET(request: Request, { params }: Ctx) {
  const segments = params.path ?? [];
  if (segments.length > 1) {
    return Response.json({ success: false, message: "Not found." }, { status: 404 });
  }
  const { search } = new URL(request.url);
  const suffix = segments.length === 1 ? `/${encodePath(segments)}` : "";
  return proxyDashboardRequest({ method: "GET", path: `/clients${suffix}${search}` });
}

/** POST /api/admin/clients — create */
export async function POST(request: Request, { params }: Ctx) {
  if ((params.path ?? []).length !== 0) {
    return Response.json({ success: false, message: "Not found." }, { status: 404 });
  }
  const body = await readJson(request);
  return proxyDashboardRequest({ method: "POST", path: "/clients", body });
}

/** PATCH /api/admin/clients/:id  or  /api/admin/clients/:id/archive */
export async function PATCH(request: Request, { params }: Ctx) {
  const segments = params.path ?? [];
  if (segments.length === 1) {
    const body = await readJson(request);
    return proxyDashboardRequest({
      method: "PATCH",
      path: `/clients/${encodePath(segments)}`,
      body,
    });
  }
  if (segments.length === 2 && LIFECYCLE_ACTIONS.has(segments[1])) {
    return proxyDashboardRequest({
      method: "PATCH",
      path: `/clients/${encodePath(segments)}`,
    });
  }
  return Response.json(
    { success: false, message: "Unknown action." },
    { status: 404 },
  );
}

/** DELETE /api/admin/clients/:id */
export async function DELETE(_request: Request, { params }: Ctx) {
  const segments = params.path ?? [];
  if (segments.length !== 1) {
    return Response.json({ success: false, message: "Not found." }, { status: 404 });
  }
  return proxyDashboardRequest({
    method: "DELETE",
    path: `/clients/${encodePath(segments)}`,
  });
}
