import { HomeHeroContent } from "./home-hero-content";
import { HomeHeroMedia } from "./home-hero-media";

export function HomeHero() {
  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-border bg-card/90 px-5 py-6 shadow-none sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <HomeHeroContent />
        <HomeHeroMedia />
      </div>
    </section>
  );
}
