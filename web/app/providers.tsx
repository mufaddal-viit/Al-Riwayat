"use client";

import type { ReactNode } from "react";

import { ConsentProvider } from "@/components/providers/consent-provider";
import { PaletteProvider } from "@/components/providers/palette-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <PaletteProvider>
        <ConsentProvider>{children}</ConsentProvider>
      </PaletteProvider>
    </ThemeProvider>
  );
}
