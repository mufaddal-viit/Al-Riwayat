import "server-only";

import { readAdminSession } from "@/lib/admin-dashboard-session";

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(
    /\/$/,
    "",
  );
}

interface ProxyOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  /** Path appended after `/admin/dashboard`, e.g. "/collections/comments". */
  path: string;
  body?: unknown;
}

/**
 * Forward an admin-panel request to the backend dashboard namespace. Enforces
 * the admin session cookie, then attaches the shared dashboard secret — the
 * single trust model for every admin-panel call.
 */
export async function proxyDashboardRequest({
  method,
  path,
  body,
}: ProxyOptions): Promise<Response> {
  const session = readAdminSession();
  if (!session) {
    return Response.json(
      { success: false, message: "Authentication required." },
      { status: 401 },
    );
  }

  const sharedSecret = process.env.ADMIN_DASHBOARD_SHARED_SECRET;
  if (!sharedSecret) {
    return Response.json(
      {
        success: false,
        message: "Admin dashboard shared secret is not configured.",
      },
      { status: 500 },
    );
  }

  const upstream = await fetch(`${apiBaseUrl()}/admin/dashboard${path}`, {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-admin-dashboard-secret": sharedSecret,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
