"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import { ThemeToggle } from "./theme-toggle";

function NavLink({
  href,
  label,
  active
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container">
        <div className="grid min-h-[88px] grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary font-heading text-lg text-secondary-foreground shadow-sm">
              M
            </span>
            <div className="space-y-0.5">
              <p className="font-heading text-xl leading-none">{siteConfig.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Editorial
              </p>
            </div>
          </Link>

          <nav className="hidden items-center justify-center gap-2 md:flex">
            {siteConfig.navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full px-4">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {siteConfig.moreItems.map((item) => (
                  <DropdownMenuItem asChild key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden items-center justify-end gap-3 md:flex">
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-end gap-3 md:hidden">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                  <SheetDescription>
                    Mobile navigation for the editorial experience.
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  {[...siteConfig.navItems, ...siteConfig.moreItems].map((item) => (
                    <Link
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className={cn(
                        "rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted",
                        pathname === item.href && "border-border bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
