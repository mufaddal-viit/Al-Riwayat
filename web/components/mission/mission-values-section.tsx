import { missionValues } from "@/lib/content/mission-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MissionValuesSection() {
  return (
    <section id="values" className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Editorial Values
        </p>
        <h2 className="text-3xl sm:text-4xl">Principles that shape every page.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {missionValues.map((value) => (
          <Card key={value.title} className="bg-card/95">
            <CardHeader>
              <CardTitle>{value.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
