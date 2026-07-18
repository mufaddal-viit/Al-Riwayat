"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./admin-nav";

interface AdminSidebarProps {
  activeKey: string;
  onSelect: (key: string) => void;
  /** Mobile drawer open state (ignored on desktop, where the rail is fixed). */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/** Ordered, de-duplicated group headings in nav order. */
function useGroups() {
  const groups: { group: string; items: typeof ADMIN_NAV }[] = [];
  for (const item of ADMIN_NAV) {
    const name = item.group ?? "";
    const last = groups[groups.length - 1];
    if (last && last.group === name) last.items.push(item);
    else groups.push({ group: name, items: [item] });
  }
  return groups;
}

function NavList({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const groups = useGroups();
  return (
    <nav className="flex flex-col gap-5 p-3">
      {groups.map(({ group, items }) => (
        <div key={group} className="space-y-1">
          {group && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
              {group}
            </p>
          )}
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({
  activeKey,
  onSelect,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  // Lock body scroll and support Escape while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onMobileClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 overflow-y-auto rounded-2xl border border-border/60 bg-card/50 lg:block">
        <NavList activeKey={activeKey} onSelect={onSelect} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            aria-hidden
            onClick={onMobileClose}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute left-0 top-0 flex h-full w-[min(82vw,20rem)] flex-col overflow-y-auto border-r border-border bg-background shadow-editorial"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList
              activeKey={activeKey}
              onSelect={(key) => {
                onSelect(key);
                onMobileClose();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
