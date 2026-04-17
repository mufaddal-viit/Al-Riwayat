import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type SiteBrandProps = {
  className?: string;
  priority?: boolean;
  size?: "header" | "footer" | "sm";
};

export function SiteBrand({
  className,
  priority = false,
  size = "header"
}: SiteBrandProps) {
  const isFooter = size === "footer";
  const isSm = size === "sm";

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isFooter ? "gap-4" : isSm ? "gap-2" : "gap-3",
        className
      )}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border border-border/60 bg-card/70 shadow-lifted backdrop-blur-xl",
          isFooter ? "h-14 w-14 sm:h-16 sm:w-16" : isSm ? "h-9 w-9" : "h-14 w-14 sm:h-16 sm:w-16"
        )}
      >
        <Image
          src={siteConfig.assets.logo}
          alt={`${siteConfig.name} logo`}
          fill
          priority={priority}
          className="object-cover"
          sizes={isFooter ? "(min-width: 640px) 64px, 56px" : isSm ? "36px" : "(min-width: 640px) 64px, 56px"}
        />
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-heading text-foreground",
            isFooter ? "text-3xl sm:text-4xl" : isSm ? "text-base leading-none" : "text-xl leading-none"
          )}
        >
          {siteConfig.name}
        </p>
        <p
          className={cn(
            "text-muted-foreground",
            isFooter
              ? "mt-2 text-sm sm:text-base"
              : isSm
              ? "mt-0.5 text-[10px] uppercase tracking-[0.2em]"
              : "mt-1 text-[11px] uppercase tracking-[0.24em]"
          )}
        >
          {isFooter ? siteConfig.description : "Premium Editorial"}
        </p>
      </div>
    </Link>
  );
}
