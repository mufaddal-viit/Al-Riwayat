import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions
}: PageIntroProps) {
  return (
    <section className="editorial-grid overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-editorial sm:p-8">
      <div className="max-w-3xl space-y-5 rounded-[1.5rem] bg-card/80 p-5 backdrop-blur sm:p-6">
        <Badge variant="outline" className="w-fit">
          {eyebrow}
        </Badge>
        <div className="space-y-3">
          <h1 className="balanced-wrap text-4xl sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
