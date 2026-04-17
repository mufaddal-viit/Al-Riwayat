"use client";

import { Palette } from "lucide-react";

import { usePalette } from "@/components/providers/palette-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  defaultPalette,
  isSitePalette,
  paletteOptions,
  type SitePalette
} from "@/lib/palette";
import { cn } from "@/lib/utils";

type PaletteToggleProps = {
  className?: string;
};

export function PaletteToggle({ className }: PaletteToggleProps) {
  const { mounted, palette, setPalette } = usePalette();
  const selectedPalette = mounted ? palette : defaultPalette;

  function handleValueChange(value: string) {
    if (isSitePalette(value)) {
      setPalette(value as SitePalette);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Change color palette"
          className={cn(
            "border-border/60 bg-card/55 text-foreground shadow-lifted backdrop-blur-xl hover:-translate-y-0.5 hover:bg-card/80",
            className
          )}
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-border/60 bg-background/88 p-2 shadow-editorial backdrop-blur-2xl"
      >
        <DropdownMenuLabel>Color Palette</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/80" />
        <DropdownMenuRadioGroup
          value={selectedPalette}
          onValueChange={handleValueChange}
        >
          {paletteOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span
                aria-hidden="true"
                className="mr-3 inline-flex h-4 w-4 rounded-full border border-border/70"
                style={{ background: option.preview }}
              />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
