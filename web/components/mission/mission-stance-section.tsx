import { missionStance } from "@/lib/content/mission-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MissionStanceSection() {
  return (
    <section>
      <Card className="bg-secondary text-secondary-foreground">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground/70">
            What We Stand For
          </p>
          <CardTitle className="text-3xl sm:text-4xl">
            {missionStance.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 text-base leading-8 text-secondary-foreground/85 lg:grid-cols-2">
          {missionStance.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
