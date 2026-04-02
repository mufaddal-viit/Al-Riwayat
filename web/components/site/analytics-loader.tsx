"use client";

import Script from "next/script";

import { useConsent } from "@/components/providers/consent-provider";
import { publicEnv } from "@/lib/public-env";

export function AnalyticsLoader() {
  const { consent } = useConsent();
  const measurementId = publicEnv.gaMeasurementId;

  if (consent !== "accepted" || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-loader" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
