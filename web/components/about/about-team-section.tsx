import Image from "next/image";

import { editorialTeam } from "@/lib/content/about-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutTeamSection() {
  return (
    <section id="team" className="space-y-6">
      <div className="space-y-3">
        <p className="text-lg uppercase tracking-[0.2em] font-extrabold text-muted-foreground">
          Team
        </p>
        <h2 className="text-3xl sm:text-4xl">
          The editorial team behind the scenes.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {editorialTeam.map((member) => (
          <Card key={member.name} className="bg-card/90">
            <div className="px-6 pt-6">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-border/60 bg-background/70 shadow-lifted sm:h-32 sm:w-32">
                <Image
                  src={member.imageUrl}
                  alt={`${member.name}, ${member.role}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            </div>
            <CardHeader className="items-center space-y-2 text-center">
              <CardTitle className="text-2xl">{member.name}</CardTitle>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {member.role}
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
