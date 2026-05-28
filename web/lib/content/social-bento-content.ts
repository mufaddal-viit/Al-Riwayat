/**
 * Content for the social proof section on the homepage — split into reels
 * (carousel) and comments (marquee). Swap placeholder paths for real assets
 * under `web/public/videos/`.
 */

export type ReelItem = {
  id: string;
  /** Path to the video file (mp4/webm). */
  src: string;
  /** Poster frame shown before the video plays. */
  poster: string;
  /** Accessible description of the reel. */
  alt: string;
  /** Short caption rendered over the reel. */
  caption?: string;
  /** Outbound link to the original Instagram post. */
  href?: string;
};

export type CommentItem = {
  id: string;
  /** Path to the comment screenshot. */
  src: string;
  /** Accessible description of the comment. */
  alt: string;
  /** Outbound link to the original Instagram post. */
  href?: string;
};

const reelPoster = "/reelcover.jpg";

export const socialBentoContent = {
  eyebrow: "From the community",
  title: "Stories that",
  titleHighlight: "reached us.",
  description:
    "Real reels and comments readers shared after Issue 1. This is the magazine living outside the page.",
  cta: {
    href: "https://instagram.com",
    label: "Follow on Instagram",
  },
  reels: [
    {
      id: "reel-feature",
      src: "/videos/Video.mov",
      poster: reelPoster,
      alt: "Reel highlighting reader reactions to Issue 1.",
      caption: "Know Al Riwayat",
      href: "https://instagram.com",
    },
    {
      id: "reel-2",
      src: "/videos/Video_1.mov",
      poster: reelPoster,
      alt: "Reel showing a reader flipping through the issue.",
      caption: "Behind the pages.",
      href: "https://instagram.com",
    },
    {
      id: "reel-3",
      src: "/videos/Video_2.mov",
      poster: reelPoster,
      alt: "Reel showing a reader flipping through the issue.",
      caption: "Rooh Al Akhlak",
      href: "https://instagram.com",
    },
  ] satisfies ReelItem[],
  comments: [
    {
      id: "comment-1",
      src: "/images/instaComments/WhatsApp%20Image%202026-05-26%20at%2007.16.45.jpeg",
      alt: "Instagram comment praising the magazine's design.",
    },
    {
      id: "comment-2",
      src: "/images/instaComments/WhatsApp%20Image%202026-05-26%20at%2007.16.46.jpeg",
      alt: "Instagram comment from a reader sharing their favourite story.",
    },
    {
      id: "comment-3",
      src: "/images/instaComments/WhatsApp%20Image%202026-05-26%20at%2007.16.47%20%281%29.jpeg",
      alt: "Instagram comment thanking the team for the issue.",
    },
    {
      id: "comment-4",
      src: "/images/instaComments/WhatsApp%20Image%202026-05-26%20at%2007.16.47%20%282%29.jpeg",
      alt: "Instagram comment asking when the next issue drops.",
    },
    {
      id: "comment-5",
      src: "/images/instaComments/WhatsApp%20Image%202026-05-26%20at%2007.16.47.jpeg",
      alt: "Instagram comment reacting to Al-Riwayat.",
    },
  ] satisfies CommentItem[],
} as const;
