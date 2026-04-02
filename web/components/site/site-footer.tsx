import Link from "next/link";

import { SiteBrand } from "@/components/site/site-brand";
import { siteConfig } from "@/lib/site";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-16 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-background/72 shadow-editorial backdrop-blur-2xl">
          {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-card/85 via-background/68 to-background/78" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-secondary/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-accent/28 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" /> */}

          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div className="space-y-5">
                {/* <div className="inline-flex w-fit rounded-full border border-border/60 bg-card/55 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground shadow-lifted">
                  Independent Editorial
                </div> */}
                <SiteBrand size="footer" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:justify-items-end">
                {/* <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Explore
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {exploreLinks.map((link) => (
                      <Link
                        key={`${link.href}-${link.label}`}
                        href={link.href}
                        className="rounded-full border border-border/60 bg-card/55 px-4 py-2 text-sm text-muted-foreground shadow-lifted transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div> */}

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Follow
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {siteConfig.socialLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-border/60 bg-card/55 px-4 py-2 text-sm text-muted-foreground shadow-lifted transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-border/80" />

            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Copyright {new Date().getFullYear()} {siteConfig.name}. All
                rights reserved.
              </p>
              <p className="max-w-xl">{siteConfig.footerNote}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
