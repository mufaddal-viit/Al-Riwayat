import Image from "next/image";

import { editorialTeam } from "@/lib/content/about-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutTeamSection() {
  return (
    <section id="team" className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Team
        </p>
        <h2 className="text-3xl sm:text-4xl">The editorial team behind the issue.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {editorialTeam.map((member) => (
          <Card key={member.name} className="overflow-hidden bg-card/90">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={member.imageUrl}
                alt={`${member.name}, ${member.role}`}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">{member.name}</CardTitle>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {member.role}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
