import { CommentsSection } from "@/components/issue/comments-section";
import { ContactUsSection } from "@/components/issue/contact-us-section";

export function ReaderEngagementSection() {
  return (
    <section
      aria-label="Reader engagement"
      className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
    >
      <CommentsSection className="mx-0 max-w-none" />
      <ContactUsSection />
    </section>
  );
}
