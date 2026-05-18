import { AboutStoryContent } from "./about-story-content";
import { AboutStoryMedia } from "./about-story-media";

export function AboutStorySection() {
  return (
    <section className="relative -mt-[100px] overflow-hidden">
      <AboutStoryMedia />
      <div className="container relative grid min-h-[85vh] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex items-center">
          <AboutStoryContent />
        </div>
        {/* Right column intentionally empty — the background image bleeds through here */}
        <div aria-hidden className="hidden lg:block" />
      </div>
    </section>
  );
}
