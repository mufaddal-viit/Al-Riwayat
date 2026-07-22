"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/context/auth-context";
import { ProfileProvider } from "@/context/profile-context";
import { ConsentProvider } from "@/components/providers/consent-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SearchProvider } from "@/components/search/search-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ConsentProvider>
        <AuthProvider>
          <ProfileProvider>
            <SearchProvider>{children}</SearchProvider>
          </ProfileProvider>
        </AuthProvider>
      </ConsentProvider>
    </ThemeProvider>
  );
}
