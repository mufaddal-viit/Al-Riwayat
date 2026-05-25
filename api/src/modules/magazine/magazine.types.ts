export const magazineStatuses = ["draft", "published", "archived"] as const;

export type MagazineStatus = (typeof magazineStatuses)[number];
