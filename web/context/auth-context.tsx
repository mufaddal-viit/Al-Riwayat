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
import { onAuthStateChanged } from "firebase/auth";

import { setAccessToken, clearAccessToken } from "@/lib/api/client";
import { firebaseAuth } from "@/lib/firebase";
import {
  loginWithGoogle as serviceLoginWithGoogle,
  exchangeFirebaseToken,
  firebaseSignOut,
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  /** No-op in no-DB mode; kept for components that still reference it. */
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

  /**
   * Single source of truth: Firebase's auth state.
   * On every change (sign-in, sign-out, token refresh, or page reload),
   * fetch a fresh Firebase ID token, exchange it for a backend JWT,
   * and reflect the result into local state.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!fbUser) {
        clearAccessToken();
        dispatch({ type: "CLEAR_USER" });
        return;
      }

      try {
        const idToken = await fbUser.getIdToken();
        const { accessToken, user } = await exchangeFirebaseToken(idToken);
        setAccessToken(accessToken);
        dispatch({ type: "SET_USER", payload: user });
      } catch (err) {
        console.error("[auth] Failed to exchange Firebase token", err);
        clearAccessToken();
        dispatch({ type: "CLEAR_USER" });
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // `signInWithPopup` triggers `onAuthStateChanged` above, which handles
    // the token exchange and state update. We still await the popup flow
    // so callers can handle errors (cancel, network) at the call site.
    const { accessToken, user } = await serviceLoginWithGoogle();
    setAccessToken(accessToken);
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut();
    clearAccessToken();
    dispatch({ type: "CLEAR_USER" });
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    // No-op: in no-DB mode, user info comes from Firebase via onAuthStateChanged.
  }, []);

  const value: AuthContextValue = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.user !== null,
    isAdmin: state.user?.role === "ADMIN",
    loginWithGoogle,
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
