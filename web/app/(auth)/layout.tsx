import type { ReactNode } from "react";

import { SiteBrand } from "@/components/site/site-brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100dvh-88px)] flex-col items-center justify-center px-4 py-16">
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]"
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Brand mark — SiteBrand is itself a Link to "/" */}
        <div className="flex justify-center">
          <SiteBrand size="sm" />
        </div>

        {children}
      </div>
    </div>
  );
}
