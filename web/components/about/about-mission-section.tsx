import {
  missionStatement,
  missionValues,
  missionStance,
} from "@/lib/content/about-content";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Mission, editorial values, and stance — folded into the About page.
 * (There is no standalone /mission route.) Headings stay at h2 so the
 * About page keeps a single h1 in its story hero.
 */
export function AboutMissionSection() {
  return (
    <section className="space-y-8 lg:space-y-10">
      {/* Statement */}
      <Card className="bg-card/90">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {missionStatement.eyebrow}
          </p>
          <h2 className="balanced-wrap max-w-4xl text-3xl sm:text-4xl">
            {missionStatement.title}
          </h2>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            {missionStatement.description}
          </p>
        </CardContent>
      </Card>

      {/* Editorial values */}
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Editorial Values
          </p>
          <h2 className="text-3xl sm:text-4xl">
            Principles that shape every page.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {missionValues.map((value) => (
            <Card key={value.title} className="bg-card/95">
              <CardHeader>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stance */}
      <Card className="bg-card/95 text-secondary-foreground">
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
