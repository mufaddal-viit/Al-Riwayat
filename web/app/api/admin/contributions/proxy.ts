import "server-only";

import { proxyDashboardRequest } from "@/lib/admin/bff-proxy";

interface ProxyOptions {
  method: "GET" | "PATCH" | "DELETE";
  /** Path appended after `/admin/dashboard/contributions`, e.g. "/abc/publish". */
  path: string;
  body?: unknown;
}

/** Forward a contribution-moderation request through the shared dashboard BFF. */
export function proxyContributionRequest({
  method,
  path,
  body,
}: ProxyOptions): Promise<Response> {
  return proxyDashboardRequest({
    method,
    path: `/contributions${path}`,
    body,
  });
}
