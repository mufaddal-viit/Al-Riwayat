export const publicEnv = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  cloudinaryCloudName:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo"
};
