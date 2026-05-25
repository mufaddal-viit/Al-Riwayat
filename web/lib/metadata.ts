import type { Metadata } from "next";

import { siteConfig } from "./site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageWidth,
  imageHeight,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const usingCustomImage = Boolean(image);
  const ogImage = new URL(image ?? siteConfig.ogImage, siteConfig.url).toString();
  const width = imageWidth ?? (usingCustomImage ? 1200 : 1200);
  const height = imageHeight ?? (usingCustomImage ? 630 : 1200);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width,
          height,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
