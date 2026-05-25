import Link from "next/link";

import { homeAboutPreview } from "@/lib/content/home-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPreviewSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="bg-card/90">
        <CardHeader className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {homeAboutPreview.eyebrow}
          </p>
          <CardTitle className="text-3xl sm:text-4xl">
            {homeAboutPreview.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="max-w-2xl text-base text-muted-foreground">
            {homeAboutPreview.description}
          </p>
          <Button asChild variant="outline">
            <Link href={homeAboutPreview.href}>{homeAboutPreview.label}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none bg-secondary text-secondary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Why this format works</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-sm leading-7">
            {homeAboutPreview.bullets.map((item) => (
              <li
                key={item}
                className="rounded-[1.25rem] border border-border/60 bg-card/40 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
