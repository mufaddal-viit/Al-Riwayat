// import { CommentsSection } from "@/components/issue/comments-section";
import { ContactUsSection } from "@/components/issue/contact-us-section";
import { CommentsSection } from "../comments/CommentsSection";

export function ReaderEngagementSection() {
  return (
    <section
      aria-label="Reader engagement"
      className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
    >
      {/* CommentsSection on Left */}
      {/* <CommentsSection className="mx-0 max-w-none" /> */}
      <CommentsSection slug="home" />

      {/* ContactUsSection on Right WIRED WITH BE */}
      <ContactUsSection />
    </section>
  );
}
