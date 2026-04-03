export const paletteOptions = [
  {
    value: "editorial",
    label: "Editorial",
    preview:
      "linear-gradient(135deg, oklch(0.9792 0.0042 78.2995) 0%, oklch(0.8936 0.0433 51.9591) 52%, oklch(0.3338 0.0606 255.638) 100%)"
  },
  {
    value: "amber",
    label: "Amber",
    preview:
      "linear-gradient(135deg, oklch(0.9885 0.0057 84.5659) 0%, oklch(0.8276 0.0752 74.44) 48%, oklch(0.5553 0.1455 48.9975) 100%)"
  }
] as const;

export type SitePalette = (typeof paletteOptions)[number]["value"];

export const defaultPalette: SitePalette = "editorial";
export const paletteStorageKey = "magazine-palette";

export function isSitePalette(value: string | null | undefined): value is SitePalette {
  return paletteOptions.some((option) => option.value === value);
}
