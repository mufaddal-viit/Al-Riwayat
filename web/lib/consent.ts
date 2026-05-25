export type ConsentState = "unknown" | "accepted" | "declined";

export const defaultConsent: ConsentState = "unknown";
export const consentStorageKey = "magazine-cookie-consent";

export function isConsentState(value: string | null | undefined): value is ConsentState {
  return value === "unknown" || value === "accepted" || value === "declined";
}
