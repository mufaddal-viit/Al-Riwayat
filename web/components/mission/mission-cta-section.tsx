import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MissionCtaSection() {
  return (
    <section>
      <Card className="border-none bg-primary text-primary-foreground shadow-editorial">
        <CardContent className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
              Continue Reading
            </p>
            <h2 className="max-w-2xl text-3xl sm:text-4xl">
              Move from the mission into the issue, or learn more about the team.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="lg">
              <Link href="/issue-1">Read Issue 1</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/about">About The Team</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
