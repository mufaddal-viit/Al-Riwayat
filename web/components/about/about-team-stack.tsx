"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

type AboutTeamStackProps = {
  members: readonly TeamMember[];
  activeIndex: number;
  name: string;
  role: string;
};

const PEEK_OFFSETS = [
  {
    translate: "translate-x-[12%]",
    scale: "scale-[0.92]",
    opacity: "opacity-90",
    z: "z-30",
  },
  {
    translate: "translate-x-[24%]",
    scale: "scale-[0.84]",
    opacity: "opacity-70",
    z: "z-20",
  },
  {
    translate: "translate-x-[36%]",
    scale: "scale-[0.76]",
    opacity: "opacity-50",
    z: "z-10",
  },
] as const;

export function AboutTeamStack({
  members,
  activeIndex,
  name,
  role,
}: AboutTeamStackProps) {
  const total = members.length;

  return (
    <div className="relative aspect-[4/5] w-full max-w-[260px] pb-6 sm:max-w-[300px]">
      {/* Peek-through stack — upcoming members */}
      {PEEK_OFFSETS.map((peek, depth) => {
        const peekIndex = (activeIndex + depth + 1) % total;
        const member = members[peekIndex];
        return (
          <div
            key={`peek-${depth}`}
            aria-hidden
            className={cn(
              "absolute inset-x-0 top-0 bottom-6 origin-right overflow-hidden rounded-[6px] transition-all duration-500 ease-out",
              peek.translate,
              peek.scale,
              peek.opacity,
              peek.z,
            )}
          >
            <Image
              src={member.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 300px, 280px"
            />
          </div>
        );
      })}

      {/* Active member — front of stack */}
      <div className="absolute inset-x-0 top-0 bottom-6 z-40 overflow-hidden rounded-[6px]">
        <Image
          key={members[activeIndex].name}
          src={members[activeIndex].imageUrl}
          alt={`${members[activeIndex].name}, ${members[activeIndex].role}`}
          fill
          priority
          className="object-cover animate-fade-in-up"
          sizes="(min-width: 1024px) 300px, 280px"
        />
      </div>

      {/* Name overlay — sits across the bottom edge of the active photo */}
      <div
        key={`label-${name}`}
        className="absolute bottom-0 left-3 right-3 z-50 border-l-2 border-primary bg-background/95 px-4 py-2.5 shadow-lifted backdrop-blur-sm animate-fade-in-up"
      >
        <p className="font-heading text-base italic leading-tight sm:text-lg">
          {name}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {role}
        </p>
      </div>
    </div>
  );
}
