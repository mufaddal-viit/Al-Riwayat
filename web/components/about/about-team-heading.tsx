export function AboutTeamHeading() {
  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-24">
      <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        <span aria-hidden className="h-px w-10 bg-primary" />
        The minds behind Al riwayat
      </p>

      <h2 className="font-heading italic leading-[0.95] text-4xl sm:text-5xl lg:text-[8rem] xl:text-[9rem] font-extrabold uppercase tracking-tight">
        Meet
        <br />
        <span className="text-primary not-italic font-light">our Team</span>
      </h2>

      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
        The voices and hands behind every page — quietly building the magazine
        you&apos;re reading.
      </p>
    </div>
  );
}
