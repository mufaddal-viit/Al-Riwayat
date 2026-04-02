import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border/70 py-8">
      <div className="container">
        <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-lifted backdrop-blur">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="font-heading text-2xl">{siteConfig.name}</p>
              <p className="text-sm text-muted-foreground">
                {siteConfig.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {siteConfig.socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Separator className="my-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
