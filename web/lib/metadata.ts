import type { Metadata } from "next";

import { siteConfig } from "./site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
};

function toAbsolute(url: string) {
  return new URL(url, siteConfig.url).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = toAbsolute(path);
  const ogImage = toAbsolute(image ?? siteConfig.ogImage);
  const mergedKeywords = keywords ?? [...siteConfig.keywords];
  const ogAuthors = authors ?? siteConfig.authors.map((a) => a.name);

  return {
    title,
    description,
    keywords: mergedKeywords,
    authors: ogAuthors.map((name) => ({ name })),
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: ogImage,
          width: siteConfig.ogImageWidth,
          height: siteConfig.ogImageHeight,
          alt: imageAlt ?? siteConfig.ogImageAlt,
          type: "image/png",
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: ogAuthors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.twitterSite,
      creator: siteConfig.twitterCreator,
      images: [
        {
          url: ogImage,
          alt: imageAlt ?? siteConfig.ogImageAlt,
        },
      ],
    },
  };
}
