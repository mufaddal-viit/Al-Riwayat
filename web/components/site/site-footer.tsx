"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SiteBrand } from "@/components/site/site-brand";
import { siteConfig } from "@/lib/site";

const socialIconMap: Record<string, LucideIcon> = {
  Instagram,
  LinkedIn: Linkedin,
  X: Twitter,
};

export function SiteFooter() {
  return (
    <footer className="mt-24 w-full">
      <div className="container space-y-12 pb-12 lg:space-y-16 lg:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-16 xl:gap-24">
          {/* LEFT — brand */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span aria-hidden className="h-px w-10 bg-primary" />
              Stay close
            </p>

            <SiteBrand size="footer" />

            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {siteConfig.footerNote}
            </p>

            <div className="flex flex-wrap gap-5 pt-2">
              {siteConfig.socialLinks.map((link) => {
                const Icon = socialIconMap[link.label] ?? Twitter;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT — explore */}
          <div className="flex flex-col gap-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Explore
            </p>

            <nav className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {[...siteConfig.navItems, ...siteConfig.moreItems].map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className="font-heading text-2xl text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary sm:text-3xl"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-5 pt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          <span aria-hidden className="h-px flex-1 bg-border/60" />
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span aria-hidden className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />
          <span className="hidden sm:inline">Built for deliberate reading</span>
          <span aria-hidden className="h-px flex-1 bg-border/60" />
        </div>
      </div>
    </footer>
  );
}
