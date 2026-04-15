"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SiteBrand } from "@/components/site/site-brand";
import { siteConfig } from "@/lib/site";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/ui/submit-button";

// ─── Social icon map ──────────────────────────────────────────────────────────

const socialIconMap: Record<string, LucideIcon> = {
  Instagram,
  LinkedIn: Linkedin,
  X: Twitter,
};

// ─── Footer ───────────────────────────────────────────────────────────────────

export function SiteFooter() {
  return (
    <footer className="mt-16 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-background/72 shadow-editorial backdrop-blur-2xl">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Top row — brand + social */}
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              {/* Brand */}
              <div className="space-y-4">
                <SiteBrand size="footer" />
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {siteConfig.footerNote}
                </p>
              </div>

              {/* Links + Social */}
              <div className="space-y-6 lg:text-right">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Follow
                  </p>
                  <div className="flex flex-wrap gap-2.5 lg:justify-end">
                    {siteConfig.socialLinks.map((link) => {
                      const Icon = socialIconMap[link.label] ?? Twitter;
                      return (
                        <SubmitButton
                          key={link.label}
                          type="button"
                          icon={Icon}
                          label={link.label}
                          variant="outline"
                          size="sm"
                          className="w-auto border-border/60 bg-card/55 shadow-lifted backdrop-blur-xl hover:-translate-y-0.5 hover:bg-card/80"
                          onClick={() => window.open(link.href, "_blank", "noopener,noreferrer")}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Explore
                  </p>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {[...siteConfig.navItems, ...siteConfig.moreItems].map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="rounded-full border border-border/60 bg-card/55 px-4 py-2 text-sm text-muted-foreground shadow-lifted transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-border/80" />

            {/* Bottom bar */}
            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                reserved.
              </p>
              <p>Built for deliberate reading.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
