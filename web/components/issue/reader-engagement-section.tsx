import { CommentsSection } from "@/components/comments/CommentsSection";
import { ContactUsSection } from "@/components/issue/contact-us-section";

export function ReaderEngagementSection() {
  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      <CommentsSection slug="home" />
      <ContactUsSection />
    </div>
  );
}
