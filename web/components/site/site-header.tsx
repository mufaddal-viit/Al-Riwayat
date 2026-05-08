"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SiteBrand } from "./site-brand";

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
        "font-bold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "text-foreground underline underline-offset-[5px] decoration-2"
          : "text-foreground/60 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="
        flex items-center justify-center
        rounded-full border border-foreground
        px-5 py-1
        sm:px-5 sm:py-1.5
        mx-auto
        w-fit
        gap-2
      "
    >
      <button
        aria-label="Light mode"
        onClick={() => setTheme("light")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-full p-2 transition-all duration-200",
          !isDark
            ? "text-foreground"
            : "text-foreground/70 hover:text-foreground",
        )}
      >
        <Sun className="h-4 w-4 stroke-[1.6]" />
        <span
          className={cn(
            "h-[3px] w-[3px] rounded-full bg-current transition-opacity duration-200",
            !isDark ? "opacity-100" : "opacity-0",
          )}
        />
      </button>

      {/* Divider */}
      <div className="mx-1 h-[16px] w-px bg-foreground opacity-60" />

      <button
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-full p-2 transition-all duration-200",
          isDark
            ? "text-foreground"
            : "text-foreground/70 hover:text-foreground",
        )}
      >
        <Moon className="h-4 w-4 stroke-[1.6]" />
        <span
          className={cn(
            "h-[3px] w-[3px] rounded-full bg-current transition-opacity duration-200",
            isDark ? "opacity-100" : "opacity-0",
          )}
        />
      </button>
    </div>
  );
}

function MobileNav({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {[...siteConfig.navItems, ...siteConfig.moreItems].map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          onClick={onClose}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cn(
            "rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname === item.href
              ? "bg-muted text-foreground font-bold"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <div className="text-center">{item.label}</div>
        </Link>
      ))}

      <div className="mt-4 border-t border-border/50 pt-4">
        <ThemeSwitcher />
      </div>
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="z-50">
      <div className="mx-auto flex min-h-[72px] max-w-[1400px] items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <SiteBrand priority />

        <nav className="hidden items-center gap-12 md:flex">
          {siteConfig.navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Desktop: theme */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
        </div>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="h-9 w-9 rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col border-border/60 bg-background/40 p-6 backdrop-blur-2xl h-[70vh] sm:h-[500px] rounded-l-2xl data-[state=open]:animate-in
                      
              
              data-[state=closed]:animate-out
                      data-[state=open]:slide-in-from-right
                      data-[state=closed]:slide-out-to-right
                      duration-300"
            >
              <SheetHeader className="space-y-3">
                <SheetTitle className="font-bold">{siteConfig.name}</SheetTitle>
              </SheetHeader>
              <MobileNav
                pathname={pathname}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
