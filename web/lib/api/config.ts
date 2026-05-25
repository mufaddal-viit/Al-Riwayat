const LOCAL_API_URL = "http://localhost:4000";

function normalizeApiBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim().replace(/\/+$/, "") ?? "";
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const configuredBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
const localBaseUrl = normalizeApiBaseUrl(LOCAL_API_URL);
const isDevelopment = process.env.NODE_ENV === "development";
const apiEnabled = process.env.NEXT_PUBLIC_ENABLE_API === "true";
const baseUrl = configuredBaseUrl || (isDevelopment ? localBaseUrl : "");

export const apiConfig = {
  baseUrl,
  enabled: apiEnabled && baseUrl.length > 0,
} as const;
