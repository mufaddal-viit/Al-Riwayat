import { readAdminSession } from "@/lib/admin-dashboard-session";

export const runtime = "nodejs";

// 4 MB — mirrors the Express cap and stays under Vercel's 4.5 MB serverless
// request-body limit (this route and the upstream api both run as functions).
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function apiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
  ).replace(/\/$/, "");
}

/**
 * Multipart passthrough for weekly editor image uploads. The shared
 * `proxyDashboardRequest` helper only forwards JSON, so uploads get their own
 * route. Same trust model: require the admin session cookie, then attach the
 * dashboard secret server-side and stream the image to Express. The file
 * itself is re-validated (signature) by the backend before Cloudinary.
 */
export async function POST(request: Request): Promise<Response> {
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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { success: false, message: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { success: false, message: "No image file provided.", code: "NO_FILE" },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { success: false, message: "Image is too large (max 4 MB).", code: "FILE_TOO_LARGE" },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return Response.json(
      {
        success: false,
        message: "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed.",
        code: "UNSUPPORTED_FILE_TYPE",
      },
      { status: 400 },
    );
  }

  const upstreamForm = new FormData();
  upstreamForm.append("file", file, file.name || "upload");

  const upstream = await fetch(`${apiBaseUrl()}/admin/dashboard/weekly-upload`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "x-admin-dashboard-secret": sharedSecret,
      // Content-Type (with multipart boundary) is set automatically for FormData.
    },
    body: upstreamForm,
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
