"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

export type ConsentState = "unknown" | "accepted" | "declined";

type ConsentContextValue = {
  consent: ConsentState;
  setConsent: (value: Exclude<ConsentState, "unknown">) => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);
const consentStorageKey = "magazine-cookie-consent";

type ConsentProviderProps = {
  children: ReactNode;
};

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [consent, setConsentState] = useState<ConsentState>("unknown");

  useEffect(() => {
    const savedValue = window.localStorage.getItem(consentStorageKey);

    if (savedValue === "accepted" || savedValue === "declined") {
      setConsentState(savedValue);
    }
  }, []);

  function setConsent(value: Exclude<ConsentState, "unknown">) {
    window.localStorage.setItem(consentStorageKey, value);
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
