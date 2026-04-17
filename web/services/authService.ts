import axios from "axios";
import { signInWithPopup, signOut } from "firebase/auth";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import { AppError } from "@/lib/api/error";
import { publicEnv } from "@/lib/public-env";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  LoginResponse,
  MeResponse,
} from "@/types/api";

// ─── Google sign-in ───────────────────────────────────────────────────────────

interface GoogleBackendUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: "CUSTOMER";
}

type GoogleLoginResponse = {
  success: boolean;
  data: { accessToken: string; user: GoogleBackendUser };
};

function googleUserToAuthUser(g: GoogleBackendUser): AuthUser {
  const parts = g.name.trim().split(/\s+/);
  const firstName = parts[0] || g.email.split("@")[0];
  const lastName = parts.slice(1).join(" ");
  const now = new Date().toISOString();
  return {
    id: g.id,
    email: g.email,
    firstName,
    lastName,
    avatarUrl: g.picture,
    role: g.role,
    isEmailVerified: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Exchange a Firebase ID token for a backend JWT. Used on popup sign-in and on refresh. */
export async function exchangeFirebaseToken(
  idToken: string,
): Promise<{ accessToken: string; user: AuthUser }> {
  const { data } = await axios.post<GoogleLoginResponse>(
    `${publicEnv.apiUrl}/auth/google`,
    { idToken },
    { headers: { "Content-Type": "application/json" } },
  );
  return {
    accessToken: data.data.accessToken,
    user: googleUserToAuthUser(data.data.user),
  };
}

/** Open the Google sign-in popup, then exchange the Firebase ID token for a backend JWT. */
export async function loginWithGoogle(): Promise<{ accessToken: string; user: AuthUser }> {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken();
    return await exchangeFirebaseToken(idToken);
  } catch (err: unknown) {
    const code = (err as { code?: string } | null)?.code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw new AppError({ message: "Sign-in cancelled.", status: 400, code });
    }
    if (code === "auth/network-request-failed") {
      throw new AppError({
        message: "Network error. Check your connection and try again.",
        status: 0,
        code,
      });
    }
    if (err instanceof AppError) throw err;
    throw new AppError({ message: "Google sign-in failed. Please try again.", status: 500 });
  }
}

/** Sign out of Firebase (local state only — backend has no session to clear). */
export async function firebaseSignOut(): Promise<void> {
  await signOut(firebaseAuth).catch(() => undefined);
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.register, input);
}

export async function login(
  input: LoginInput,
): Promise<{ accessToken: string; user: AuthUser }> {
  const { data } = await apiClient.post<LoginResponse>(
    ENDPOINTS.auth.login,
    input,
  );
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.logout).catch(() => {
    // Best-effort: backend may already have expired the token.
    // The client always clears local state regardless.
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.verifyEmail, { token });
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.resendVerification, { email });
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.forgotPassword, input);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await apiClient.post(ENDPOINTS.auth.resetPassword, input);
}

// ─── Authenticated ────────────────────────────────────────────────────────────

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<MeResponse>(ENDPOINTS.auth.me);
  return data.data.user;
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const { data } = await apiClient.patch<MeResponse>(
    ENDPOINTS.auth.updateProfile,
    input,
  );
  return data.data.user;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.patch(ENDPOINTS.auth.changePassword, input);
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete(ENDPOINTS.auth.deleteAccount);
}
