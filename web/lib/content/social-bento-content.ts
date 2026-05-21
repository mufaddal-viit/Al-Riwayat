/**
 * Content for the social proof section on the homepage — split into reels
 * (carousel) and comments (marquee). Swap placeholder paths for real assets
 * under `web/public/social/`.
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
      src: "/social/reel-feature.mp4",
      poster: "/social/reel-feature-poster.jpg",
      alt: "Reel highlighting reader reactions to Issue 1.",
      caption: "Issue 1, through your eyes.",
      href: "https://instagram.com",
    },
    {
      id: "reel-2",
      src: "/social/reel-2.mp4",
      poster: "/social/reel-2-poster.jpg",
      alt: "Reel showing a reader flipping through the issue.",
      caption: "Behind the pages.",
      href: "https://instagram.com",
    },
  ] satisfies ReelItem[],
  comments: [
    {
      id: "comment-1",
      src: "/social/comment-1.jpg",
      alt: "Instagram comment praising the magazine's design.",
    },
    {
      id: "comment-2",
      src: "/social/comment-2.jpg",
      alt: "Instagram comment from a reader sharing their favourite story.",
    },
    {
      id: "comment-3",
      src: "/social/comment-3.jpg",
      alt: "Instagram comment thanking the team for the issue.",
    },
    {
      id: "comment-4",
      src: "/social/comment-4.jpg",
      alt: "Instagram comment asking when the next issue drops.",
    },
  ] satisfies CommentItem[],
} as const;
