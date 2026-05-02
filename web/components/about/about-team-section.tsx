"use client";

import { useState } from "react";

import { editorialTeam } from "@/lib/content/about-content";

import { AboutTeamControls } from "./about-team-controls";
import { AboutTeamCounter } from "./about-team-counter";
import { AboutTeamHeading } from "./about-team-heading";
import { AboutTeamInfo } from "./about-team-info";
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
    <section
      id="team"
      aria-label="Editorial team"
      className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16 xl:gap-24"
    >
      <AboutTeamHeading />

      <div className="flex flex-col items-center gap-8">
        <div className="flex w-full justify-center">
          <AboutTeamStack members={editorialTeam} activeIndex={activeIndex} />
        </div>

        <AboutTeamInfo name={member.name} role={member.role} />

        <AboutTeamControls onPrev={prev} onNext={next} />

        <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        <div className="flex w-full items-center justify-end pt-2">
          <AboutTeamCounter current={activeIndex + 1} total={total} />
        </div>
      </div>
    </section>
  );
}
