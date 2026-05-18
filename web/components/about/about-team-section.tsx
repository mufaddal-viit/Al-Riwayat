"use client";

import { useState } from "react";
import Image from "next/image";

import { editorialTeam } from "@/lib/content/about-content";

import { AboutTeamControls } from "./about-team-controls";
import { AboutTeamCounter } from "./about-team-counter";
import { AboutTeamHeading } from "./about-team-heading";
import { AboutTeamList } from "./about-team-list";
import { AboutTeamStack } from "./about-team-stack";

export function AboutTeamSection() {
  const total = editorialTeam.length;
  const [activeIndex, setActiveIndex] = useState(0);

  const member = editorialTeam[activeIndex];

  function next() {
    setActiveIndex((i) => (i + 1) % total);
  }

  function prev() {
    setActiveIndex((i) => (i - 1 + total) % total);
  }

  return (
    <section id="team" aria-label="Editorial team">
      {/* DESKTOP - 3-column: heading, photo, list */}
      <div className="hidden lg:grid lg:min-h-[640px] lg:grid-cols-[minmax(15rem,0.78fr)_minmax(22rem,0.95fr)_minmax(17rem,0.72fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(16rem,0.76fr)_minmax(25rem,0.95fr)_minmax(18rem,0.72fr)] xl:gap-20 2xl:gap-24">
        <AboutTeamHeading />

        <div className="relative mx-auto w-full max-w-[500px] lg:sticky lg:top-20">
          <div
            aria-hidden
            className="absolute -left-4 top-4 h-[101%] w-full border rounded-[8px] border-primary/70 xl:-left-5"
          />
          {/* <div
            aria-hidden
            className="absolute -right-4 top-16 h-28 w-16 border-y border-primary/50 xl:-right-6 xl:h-36"
          /> */}

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px] bg-muted shadow-editorial ring-1 ring-border/60">
            <Image
              key={member.imageUrl}
              src={member.imageUrl}
              alt={`${member.name}, ${member.role}`}
              fill
              priority
              className="animate-fade-in-up object-cover object-center"
              sizes="(min-width: 1536px) 500px, (min-width: 1280px) 400px, 352px"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/85 via-background/20 to-transparent"
            />
            <div className="absolute right-4 top-4 z-10 bg-background/90 px-3 py-2 shadow-lifted backdrop-blur-sm xl:right-5 xl:top-5">
              <AboutTeamCounter current={activeIndex + 1} total={total} />
            </div>
          </div>

          <div
            key={`desktop-label-${member.name}`}
            className="absolute bottom-5 left-5 right-5 z-10 border-l-4 rounded-md border-primary bg-background/95 px-5 py-4 shadow-lifted backdrop-blur-sm animate-fade-in-up xl:left-7 xl:right-7"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              In focus
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
              {member.bio}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:sticky lg:top-24">
          <AboutTeamList
            members={editorialTeam}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>

      {/* MOBILE / TABLET - carousel */}
      <div className="grid gap-10 lg:hidden">
        <AboutTeamHeading />

        <div className="flex flex-col items-center gap-8 overflow-hidden">
          <div className="flex w-full justify-center">
            <AboutTeamStack
              members={editorialTeam}
              activeIndex={activeIndex}
              name={member.name}
              role={member.role}
            />
          </div>

          <AboutTeamControls onPrev={prev} onNext={next} />

          <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            {member.bio}
          </p>

          <div className="flex w-full items-center justify-end pt-2">
            <AboutTeamCounter current={activeIndex + 1} total={total} />
          </div>
        </div>
      </div>
    </section>
  );
}
