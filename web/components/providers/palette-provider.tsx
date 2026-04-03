"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  defaultPalette,
  isSitePalette,
  paletteStorageKey,
  type SitePalette
} from "@/lib/palette";

type PaletteContextValue = {
  palette: SitePalette;
  mounted: boolean;
  setPalette: (palette: SitePalette) => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

function applyPalette(palette: SitePalette) {
  document.documentElement.dataset.palette = palette;
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<SitePalette>(defaultPalette);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedPalette = window.localStorage.getItem(paletteStorageKey);
    const nextPalette = isSitePalette(storedPalette)
      ? storedPalette
      : defaultPalette;

    applyPalette(nextPalette);
    setPaletteState(nextPalette);
    setMounted(true);
  }, []);

  function setPalette(nextPalette: SitePalette) {
    applyPalette(nextPalette);
    setPaletteState(nextPalette);
    window.localStorage.setItem(paletteStorageKey, nextPalette);
  }

  const value = useMemo(
    () => ({
      palette,
      mounted,
      setPalette
    }),
    [mounted, palette]
  );

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);

  if (!context) {
    throw new Error("usePalette must be used within a PaletteProvider.");
  }

  return context;
}
