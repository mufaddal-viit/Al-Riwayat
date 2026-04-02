"use client";

import type { ReactNode } from "react";

import { ConsentProvider } from "@/components/providers/consent-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConsentProvider>{children}</ConsentProvider>
    </ThemeProvider>
  );
}
