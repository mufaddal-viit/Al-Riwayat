"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

import { buttonVariants } from "@/components/ui/button";
import { SearchTrigger } from "@/components/search/search-trigger";

import { SiteBrand } from "./site-brand";

const MOBILE_NAV_DIALOG_ID = "site-mobile-nav";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 dark:border-border/20 dark:bg-background/30 dark:supports-[backdrop-filter]:bg-background/20">
      <div className="mx-auto flex min-h-[72px] max-w-[1400px] items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <SiteBrand priority />

        <nav className="hidden items-center gap-6 md:flex lg:gap-10 xl:gap-12">
          {siteConfig.navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* Desktop: search + theme */}
        <div className="hidden items-center gap-3 md:flex">
          <SearchTrigger />
          <ThemeSwitcher />
        </div>

        <div className="relative flex items-center gap-2 md:hidden">
          <SearchTrigger />
          <button
            type="button"
            aria-label="Open menu"
            aria-controls={MOBILE_NAV_DIALOG_ID}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9 cursor-pointer rounded-full",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>

          {mobileNavOpen ? (
            <div className="fixed inset-0 z-[60] md:hidden">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
                className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              />
              <div
                id={MOBILE_NAV_DIALOG_ID}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-title"
                className="absolute right-0 top-0 flex h-[70vh] w-[min(85vw,24rem)] flex-col rounded-l-2xl border-l border-border/60 bg-background/90 p-6 shadow-editorial backdrop-blur-2xl sm:h-[500px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 id="mobile-nav-title" className="font-bold">
                    {siteConfig.name}
                  </h2>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMobileNavOpen(false)}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <MobileNav
                  pathname={pathname}
                  onClose={() => setMobileNavOpen(false)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
