"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/context/auth-context";
import type { UserRole } from "@/types/api";

/** Access the current auth state from anywhere inside <AuthProvider>. */
export function useAuth() {
  return useAuthContext();
}

/**
 * Redirect unauthenticated users to /login.
 * Place at the top of any page that requires a logged-in user.
 *
 * @param requiredRole  Optional — also redirects if the user lacks this role.
 */
export function useProtectedRoute(requiredRole?: UserRole) {
  const { isLoading, isAuthenticated, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  return { isLoading, isAuthenticated, user };
}
