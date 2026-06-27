import { proxyContributionRequest } from "./proxy";

export const runtime = "nodejs";

/** GET /api/admin/contributions?status=pending — moderation list. */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return proxyContributionRequest({ method: "GET", path: `/${search}` });
}
