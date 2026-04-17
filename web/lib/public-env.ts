function withFallback(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

export const publicEnv = {
  siteUrl: withFallback(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  gaMeasurementId: withFallback(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, ""),
  apiUrl: withFallback(process.env.NEXT_PUBLIC_API_URL, "http://localhost:4000"),
  cloudinaryCloudName: withFallback(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    "demo"
  ),
  firebase: {
    apiKey:       process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain:   process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId:    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    appId:        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
};
