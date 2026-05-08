"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type AboutTeamControlsProps = {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

const buttonClass =
  "group flex h-12 w-20 items-center justify-center rounded-full border border-border text-foreground transition-all duration-200 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function AboutTeamControls({
  onPrev,
  onNext,
  className,
}: AboutTeamControlsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        aria-label="Previous team member"
        onClick={onPrev}
        className={buttonClass}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        type="button"
        aria-label="Next team member"
        onClick={onNext}
        className={buttonClass}
      >
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
