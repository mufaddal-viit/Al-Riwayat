import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { normalizeError } from "./error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const REQUEST_TIMEOUT = 15_000; // 15 s

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,          // sends httpOnly refresh-token cookie on every request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Token helpers ─────────────────────────────────────────────────────────────
// Access token lives in memory (module-level variable) so it is never readable
// by third-party scripts.  Falls back to localStorage for page refreshes.

const ACCESS_TOKEN_KEY = "access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Called by the auth context on logout / session expiry
export function clearSession(): void {
  clearAccessToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ─── Request interceptor — attach Bearer token ────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — silent token refresh on 401 ──────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401s that haven't been retried yet
    // and are not the refresh endpoint itself (prevents infinite loop)
    const isRefreshEndpoint = original.url?.includes("/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // Queue the failed request — it will be retried after refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch(Promise.reject.bind(Promise));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error as AxiosError<import("@/types/api").ApiError>));
  },
);

// ─── Refresh helper ───────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string> {
  // Use a plain axios call (not apiClient) to avoid triggering the interceptor again
  const { data } = await axios.post<{
    success: boolean;
    data: { accessToken: string };
  }>(
    `${BASE_URL}/auth/refresh`,
    null,
    { withCredentials: true },
  );
  return data.data.accessToken;
}
