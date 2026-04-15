import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
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
