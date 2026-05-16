import {
  missionStatement,
  missionValues,
  missionStance,
} from "@/lib/content/about-content";

/**
 * Mission, editorial values, and stance — folded into the About page using
 * the same borderless editorial language as the story and team sections
 * (eyebrow rule + large heading + muted prose). No cards, no boxes.
 * Headings stay at h2 so the About page keeps a single h1 in its story hero.
 */
export function AboutMissionSection() {
  return (
    <section aria-label="Mission" className="space-y-16 lg:space-y-24">
      {/* ── Statement ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-10 bg-primary" />
          {missionStatement.eyebrow}
        </p>

        <h2 className="balanced-wrap max-w-4xl font-heading text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          {missionStatement.title}
        </h2>

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {missionStatement.description}
        </p>
      </div>

      {/* ── Editorial values ───────────────────────────────────────────── */}
      <div className="space-y-10">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-10 bg-primary" />
          Editorial Values
        </p>

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-3">
          {missionValues.map((value, index) => (
            <div key={value.title} className="space-y-3">
              <span className="block font-heading text-2xl italic text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl sm:text-2xl">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stance ─────────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden className="h-px w-10 bg-primary" />
            What We Stand For
          </p>
          <h2 className="balanced-wrap font-heading text-3xl leading-[1.1] sm:text-4xl">
            {missionStance.title}
          </h2>
        </div>

        <div className="max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          {missionStance.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
