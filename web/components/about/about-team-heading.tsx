import { AboutEyebrow } from "./about-eyebrow";

export function AboutTeamHeading() {
  return (
    <div className="relative flex flex-col gap-6 lg:sticky lg:top-24 lg:min-h-[520px]">
      <div className="flex flex-col gap-6">
        <AboutEyebrow>Meet Our Team</AboutEyebrow>

        <h2 className="max-w-[10ch] font-heading text-4xl font-extrabold uppercase italic leading-[1] tracking-normal sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
          The minds
          <br />
          <span className="font-light not-italic text-primary">behind</span>
          <br />
          <span className="font-light not-italic text-primary">Al Riwayat</span>
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-[15px]">
          The voices and hands behind every page, quietly building the magazine
          you&apos;re reading.
        </p>
      </div>
    </div>
  );
}
