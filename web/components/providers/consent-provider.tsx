"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import {
  consentStorageKey,
  defaultConsent,
  isConsentState,
  type ConsentState
} from "@/lib/consent";

export type { ConsentState };

type ConsentContextValue = {
  consent: ConsentState;
  setConsent: (value: Exclude<ConsentState, "unknown">) => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

type ConsentProviderProps = {
  children: ReactNode;
};

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [consent, setConsentState] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const fromAttr = document.documentElement.dataset.consent;
    if (isConsentState(fromAttr) && fromAttr !== defaultConsent) {
      setConsentState(fromAttr);
      return;
    }
    const saved = window.localStorage.getItem(consentStorageKey);
    if (isConsentState(saved) && saved !== defaultConsent) {
      setConsentState(saved);
    }
  }, []);

  function setConsent(value: Exclude<ConsentState, "unknown">) {
    window.localStorage.setItem(consentStorageKey, value);
    document.documentElement.dataset.consent = value;
    setConsentState(value);
  }

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider.");
  }

  return context;
}
