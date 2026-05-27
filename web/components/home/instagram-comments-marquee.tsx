"use client";

import Image from "next/image";
import Link from "next/link";

import { Marquee } from "@/components/ui/marquee";
import type { CommentItem } from "@/lib/content/social-bento-content";

interface InstagramCommentsMarqueeProps {
  comments: readonly CommentItem[];
}

function CommentCard({ comment }: { comment: CommentItem }) {
  const inner = (
    <div className="flex h-[clamp(260px,72vw,360px)] w-[clamp(220px,70vw,320px)] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-lifted">
      <div className="relative h-full w-full">
        <Image
          src={comment.src}
          alt={comment.alt}
          fill
          sizes="(min-width: 640px) 320px, 70vw"
          className="object-contain"
        />
      </div>
    </div>
  );

  if (comment.href) {
    return (
      <Link
        href={comment.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open on Instagram: ${comment.alt}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

export function InstagramCommentsMarquee({ comments }: InstagramCommentsMarqueeProps) {
  if (comments.length === 0) return null;

  return (
    <div
      aria-label="Reader comments from Instagram"
      className="relative w-full overflow-hidden"
    >
      <Marquee pauseOnHover className="[--duration:50s]">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </Marquee>
    </div>
  );
}
