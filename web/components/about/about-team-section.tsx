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
      {/* DESKTOP — 3-column: heading · photo · list */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start lg:gap-24 xl:gap-32">
        <AboutTeamHeading />

        <div className="relative mx-auto w-full max-w-[420px] pb-6">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[8px]">
            <Image
              key={member.imageUrl}
              src={member.imageUrl}
              alt={`${member.name}, ${member.role}`}
              fill
              priority
              className="object-cover animate-fade-in-up"
              sizes="(min-width: 1280px) 420px, 360px"
            />
          </div>
          <div
            key={`desktop-label-${member.name}`}
            className="absolute -bottom-1 left-6 right-6 z-10 border-l-2 border-primary bg-background px-5 py-3 shadow-lifted animate-fade-in-up"
          >
            <p className="font-heading text-xl italic leading-tight sm:text-2xl">
              {member.name}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {member.role}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:sticky lg:top-24">
          <AboutTeamList
            members={editorialTeam}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        </div>
      </div>

      {/* MOBILE / TABLET — carousel */}
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
