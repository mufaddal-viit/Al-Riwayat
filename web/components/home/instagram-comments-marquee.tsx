"use client";

import Image from "next/image";
import Link from "next/link";

import { Marquee } from "@/components/ui/marquee";
import type { CommentItem } from "@/lib/content/social-bento-content";
import { cn } from "@/lib/utils";

interface InstagramCommentsMarqueeProps {
  comments: readonly CommentItem[];
}

function CommentCard({ comment }: { comment: CommentItem }) {
  const inner = (
    <div className="relative aspect-[4/3] w-[280px] overflow-hidden rounded-2xl border border-border bg-card shadow-lifted sm:w-[320px]">
      <Image
        src={comment.src}
        alt={comment.alt}
        fill
        sizes="(min-width: 640px) 320px, 280px"
        className="object-cover"
      />
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
      className={cn(
        "relative w-full overflow-hidden",
        // Soft edge masks so cards fade in/out at the rim.
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
      )}
    >
      <Marquee pauseOnHover className="[--duration:50s]">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </Marquee>
    </div>
  );
}
