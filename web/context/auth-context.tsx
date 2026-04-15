"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/lib/api/client";
import * as authService from "@/services/authService";
import type { AuthUser, LoginInput, RegisterInput } from "@/types/api";

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_USER"; payload: AuthUser }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.payload, isLoading: false };
    case "CLEAR_USER":
      return { user: null, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
  });

  /** Fetch the current user from the API and update state. */
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch {
      dispatch({ type: "CLEAR_USER" });
      clearAccessToken();
    }
  }, []);

  /**
   * On mount: if an access token exists in localStorage, validate it by
   * fetching the current user. The axios interceptor handles silent refresh
   * if the token is expired.
   */
  useEffect(() => {
    if (getAccessToken()) {
      refreshUser();
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [refreshUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { accessToken, user } = await authService.login(input);
      setAccessToken(accessToken);
      dispatch({ type: "SET_USER", payload: user });
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput) => {
    await authService.register(input);
    // Registration does not auto-login — user must verify email first
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearAccessToken();
    dispatch({ type: "CLEAR_USER" });
    router.push("/login");
  }, [router]);

  const value: AuthContextValue = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.user !== null,
    isAdmin: state.user?.role === "ADMIN",
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
