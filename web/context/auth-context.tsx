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

import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/api/client";
import {
  login as serviceLogin,
  logout as serviceLogout,
  getMe,
} from "@/services/authService";
import type { AuthUser } from "@/types/api";

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
  loginWithEmail: (email: string, password: string) => Promise<void>;
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

  // Restore session on mount: if a stored access token exists, fetch the user.
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      dispatch({ type: "CLEAR_USER" });
      return;
    }
    getMe()
      .then((user) => dispatch({ type: "SET_USER", payload: user }))
      .catch(() => {
        clearAccessToken();
        dispatch({ type: "CLEAR_USER" });
      });
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await serviceLogin({ email, password });
    setAccessToken(accessToken);
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const logout = useCallback(async () => {
    await serviceLogout();
    clearAccessToken();
    dispatch({ type: "CLEAR_USER" });
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const user = await getMe();
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const value: AuthContextValue = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.user !== null,
    isAdmin: state.user?.role === "ADMIN",
    loginWithEmail,
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
