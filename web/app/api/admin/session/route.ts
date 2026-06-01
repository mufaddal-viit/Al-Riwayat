import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSession,
  readAdminSession,
  validateAdminCredentials,
} from "@/lib/admin-dashboard-session";

export const runtime = "nodejs";

export async function GET() {
  const session = readAdminSession();

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };

    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json(
        { success: false, message: "Invalid admin credentials." },
        { status: 401 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const response = NextResponse.json({
      success: true,
      authenticated: true,
      email: normalizedEmail,
    });

    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSession(normalizedEmail),
      adminSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not create an admin session.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
