"use client";

import { useConsent } from "@/components/providers/consent-provider";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const { consent, setConsent } = useConsent();

  if (consent !== "unknown") {
    return null;
  }

  return (
    <div data-cookie-consent className="fixed inset-x-0 bottom-0 z-40 p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[1.75rem] border border-border bg-card/95 p-4 shadow-editorial backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="max-w-2xl text-sm text-muted-foreground">
          We use cookies for analytics.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConsent("declined")}
          >
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setConsent("accepted")}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
