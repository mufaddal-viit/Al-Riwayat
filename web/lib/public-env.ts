function withFallback(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
const siteUrlFallback = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3001";

export const publicEnv = {
  siteUrl: withFallback(process.env.NEXT_PUBLIC_SITE_URL, siteUrlFallback),
  gaMeasurementId: withFallback(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, ""),
  apiUrl: withFallback(process.env.NEXT_PUBLIC_API_URL, "http://localhost:4000/api"),
};
