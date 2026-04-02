import type { Metadata } from "next";

import { siteConfig } from "./site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  image
}: BuildMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImage = new URL(image ?? siteConfig.ogImage, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1600,
          height: 900,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}
