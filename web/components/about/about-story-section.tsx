import { AboutStoryContent } from "./about-story-content";

export function AboutStorySection() {
  return (
    <section className="relative -mt-[100px] overflow-hidden">
      {/* Right-side ombre wash — soft primary glow fading toward the left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_80%_at_100%_50%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_50%_60%_at_95%_20%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_70%)]"
      />

      {/* Soft fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-background"
      />

      <div className="container relative flex min-h-[85vh] items-center">
        <AboutStoryContent />
      </div>
    </section>
  );
}
