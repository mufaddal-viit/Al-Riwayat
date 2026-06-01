import { NextResponse } from "next/server";

import { readAdminSession } from "@/lib/admin-dashboard-session";

export const runtime = "nodejs";

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(
    /\/$/,
    "",
  );
}

export async function GET() {
  const session = readAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: 401 },
    );
  }

  const sharedSecret = process.env.ADMIN_DASHBOARD_SHARED_SECRET;
  if (!sharedSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin dashboard shared secret is not configured.",
      },
      { status: 500 },
    );
  }

  const upstream = await fetch(`${apiBaseUrl()}/admin/dashboard`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "x-admin-dashboard-secret": sharedSecret,
    },
  });
  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
