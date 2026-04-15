"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, LogOut, Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
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
import { PaletteToggle } from "./palette-toggle";
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

// ─── User nav (desktop) ────────────────────────────────────────────────────────

function UserNav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (!isAuthenticated || isLoading) {
    return (
      <SubmitButton
        type="button"
        icon={LogIn}
        label="Sign in"
        size="sm"
        className="w-auto"
        onClick={() => (window.location.href = "/login")}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            navChipClass,
            "gap-2 border-border/60 bg-card/55 shadow-lifted backdrop-blur-xl hover:-translate-y-0.5 hover:bg-card/80",
          )}
          aria-label="Account menu"
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="max-w-[120px] truncate text-sm">
            {user?.firstName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-border/60 bg-background/82 p-2 shadow-editorial backdrop-blur-2xl"
      >
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/80" />
        <DropdownMenuItem asChild>
          <Link href="/account" className="gap-2">
            <User className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/80" />
        <DropdownMenuItem
          onClick={() => logout()}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Mobile nav ────────────────────────────────────────────────────────────────

function MobileNav({
  pathname,
  onClose,
  isAuthenticated,
}: {
  pathname: string;
  onClose: () => void;
  isAuthenticated: boolean;
}) {
  const { user, logout } = useAuth();
  const mobileLinkClass = cn(
    "rounded-[1.25rem] border px-4 py-3 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );

  return (
    <nav className="mt-8 flex flex-col gap-2">
      {[...siteConfig.navItems, ...siteConfig.moreItems].map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          onClick={onClose}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cn(
            mobileLinkClass,
            pathname === item.href
              ? "border-border/70 bg-card/80 text-foreground shadow-lifted"
              : "border-transparent bg-card/45 text-muted-foreground hover:border-border/60 hover:bg-card/70 hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}

      {/* Auth links */}
      <div className="mt-4 border-t border-border/50 pt-4">
        {isAuthenticated ? (
          <>
            <p className="mb-2 truncate px-1 text-xs text-muted-foreground">
              {user?.email}
            </p>
            <Link
              href="/account"
              onClick={onClose}
              className={cn(
                mobileLinkClass,
                "flex items-center gap-2 border-transparent bg-card/45 text-muted-foreground hover:border-border/60 hover:bg-card/70 hover:text-foreground",
              )}
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className={cn(
                mobileLinkClass,
                "mt-2 flex w-full items-center gap-2 border-transparent bg-card/45 text-destructive hover:border-border/60 hover:bg-card/70",
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <SubmitButton
            type="button"
            icon={LogIn}
            label="Sign in"
            onClick={() => {
              onClose();
              window.location.href = "/login";
            }}
          />
        )}
      </div>
    </nav>
  );
}

// ─── SiteHeader ────────────────────────────────────────────────────────────────

export function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

            <div className="hidden items-center justify-end gap-2 md:flex">
              <PaletteToggle />
              <ThemeToggle />
              <UserNav />
            </div>

            <div className="flex items-center justify-end gap-2 md:hidden">
              <PaletteToggle className="h-11 w-11" />
              <ThemeToggle className="h-11 w-11" />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                      Explore the magazine through a calmer, mobile-first
                      reading menu.
                    </SheetDescription>
                  </SheetHeader>
                  <MobileNav
                    pathname={pathname}
                    onClose={() => setIsMobileMenuOpen(false)}
                    isAuthenticated={isAuthenticated}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
