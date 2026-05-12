"use client";

import { cn } from "@/lib/utils";

type TeamMember = {
  name: string;
  role: string;
};

type AboutTeamListProps = {
  members: readonly TeamMember[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function AboutTeamList({
  members,
  activeIndex,
  onSelect,
}: AboutTeamListProps) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <span aria-hidden className="h-px w-7 bg-border" />
        The Team
      </p>

      <ul className="border-t border-border/60">
        {members.map((member, i) => {
          const active = i === activeIndex;
          return (
            <li key={`${member.name}-${i}`}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={active}
                aria-label={`Show ${member.name}, ${member.role}`}
                className={cn(
                  "group flex w-full items-center gap-5 border-b border-border/60 py-4 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.22em] tabular-nums transition-colors",
                    active ? "text-primary" : "text-muted-foreground/70",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className={cn(
                    "flex-1 truncate font-heading text-lg leading-tight transition-all",
                    active && "italic",
                  )}
                >
                  {member.name}
                </span>

                <span
                  className={cn(
                    "hidden shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 transition-opacity xl:inline",
                    active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-70",
                  )}
                >
                  {member.role}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
