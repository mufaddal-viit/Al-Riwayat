import { missionStatement } from "@/lib/content/mission-content";
import { Card, CardContent } from "@/components/ui/card";

export function MissionStatementSection() {
  return (
    <section>
      <Card className="bg-card/90">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {missionStatement.eyebrow}
          </p>
          <h1 className="balanced-wrap max-w-4xl text-4xl sm:text-5xl">
            {missionStatement.title}
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            {missionStatement.description}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
