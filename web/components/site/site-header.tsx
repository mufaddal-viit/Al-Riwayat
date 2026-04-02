"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SiteBrand } from "./site-brand";
import { ThemeToggle } from "./theme-toggle";

const navChipClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        navChipClass,
        active
          ? "border-border/70 bg-card/80 text-foreground shadow-lifted"
          : "border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-card/60 hover:text-foreground hover:shadow-lifted",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/72 shadow-editorial backdrop-blur-2xl">
          <div className="relative grid min-h-[88px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-6">
            <SiteBrand priority />

            <div className="hidden justify-center md:flex">
              <nav className="flex items-center gap-1.5 p-1.5">
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
                    <Button
                      variant="ghost"
                      className={cn(
                        navChipClass,
                        "gap-2 border-transparent bg-transparent px-4 text-muted-foreground hover:border-border/60 hover:bg-card/60 hover:text-foreground hover:shadow-lifted",
                      )}
                    >
                      More
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="border-border/60 bg-background/82 p-2 shadow-editorial backdrop-blur-2xl"
                  >
                    <DropdownMenuLabel>Explore</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/80" />
                    {siteConfig.moreItems.map((item) => (
                      <DropdownMenuItem asChild key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>

            <div className="hidden items-center justify-end md:flex">
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-end gap-2 md:hidden">
              <ThemeToggle className="h-11 w-11" />
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open menu"
                    className="border-border/60 bg-card/55 shadow-lifted backdrop-blur-xl hover:-translate-y-0.5 hover:bg-card/80"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col border-border/60 bg-background/86 p-6 backdrop-blur-2xl"
                >
                  <SheetHeader className="space-y-3">
                    <SheetTitle>{siteConfig.name}</SheetTitle>
                    <SheetDescription>
                      Explore the magazine through a calmer, mobile-first reading menu.
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-col gap-2">
                    {[...siteConfig.navItems, ...siteConfig.moreItems].map(
                      (item) => (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          aria-current={
                            pathname === item.href ? "page" : undefined
                          }
                          className={cn(
                            "rounded-[1.25rem] border px-4 py-3 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            pathname === item.href
                              ? "border-border/70 bg-card/80 text-foreground shadow-lifted"
                              : "border-transparent bg-card/45 text-muted-foreground hover:border-border/60 hover:bg-card/70 hover:text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      ),
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
