/**
 * Content for the social proof bento section on the homepage.
 *
 * Each item is a "video-ready" card: it can render either a still image
 * (Instagram comment screenshot) or a looping video (Reel). Swap the
 * placeholder `src` values for real assets under `web/public/social/`.
 *
 * Grid placement is driven by `span` — the section composes these into an
 * asymmetric bento mosaic. The `feature` card is the large centerpiece.
 */

export type BentoMediaKind = "image" | "video";

export type BentoCardItem = {
  /** Stable key + used for the aria-label. */
  id: string;
  kind: BentoMediaKind;
  /** Image path, or video path for `kind: "video"`. */
  src: string;
  /** Poster frame shown before a video plays / while it loads. */
  poster?: string;
  /** Accessible description of the media. */
  alt: string;
  /** Short caption rendered over the media. */
  caption?: string;
  /** Tiny label chip, e.g. "Reel", "Comment". */
  tag?: string;
  /** Optional outbound link to the original Instagram post. */
  href?: string;
  /** Column / row span on the lg bento grid. */
  span: "feature" | "tall" | "wide" | "default";
};

export const socialBentoContent = {
  eyebrow: "From the community",
  title: "Stories that",
  titleHighlight: "reached us.",
  description:
    "Real comments, reactions, and reels readers shared after Issue 1. This is the magazine living outside the page.",
  cta: {
    href: "https://instagram.com",
    label: "Follow on Instagram",
  },
  cards: [
    {
      id: "reel-feature",
      kind: "video",
      src: "/social/reel-feature.mp4",
      poster: "/social/reel-feature-poster.jpg",
      alt: "Reel highlighting reader reactions to Issue 1.",
      caption: "Issue 1, through your eyes.",
      tag: "Reel",
      href: "https://instagram.com",
      span: "feature",
    },
    {
      id: "comment-1",
      kind: "image",
      src: "/social/comment-1.jpg",
      alt: "Instagram comment praising the magazine's design.",
      tag: "Comment",
      span: "default",
    },
    {
      id: "comment-2",
      kind: "image",
      src: "/social/comment-2.jpg",
      alt: "Instagram comment from a reader sharing their favourite story.",
      tag: "Comment",
      span: "tall",
    },
    {
      id: "reel-2",
      kind: "video",
      src: "/social/reel-2.mp4",
      poster: "/social/reel-2-poster.jpg",
      alt: "Reel showing a reader flipping through the issue.",
      caption: "Behind the pages.",
      tag: "Reel",
      span: "wide",
    },
    {
      id: "comment-3",
      kind: "image",
      src: "/social/comment-3.jpg",
      alt: "Instagram comment thanking the team for the issue.",
      tag: "Comment",
      span: "default",
    },
    {
      id: "comment-4",
      kind: "image",
      src: "/social/comment-4.jpg",
      alt: "Instagram comment asking when the next issue drops.",
      tag: "Comment",
      span: "default",
    },
  ] satisfies BentoCardItem[],
} as const;
