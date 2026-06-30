/**
 * Weekly Riwayat — short, admin-authored articles published on a weekly cadence.
 * Unlike contributions (visitor submissions needing moderation), these are
 * created by the admin from scratch, so the lifecycle is a simple editorial one.
 *
 *   draft     — being written, not visible publicly
 *   published — live on /weekly-riwayat
 *   archived  — retired from the public listing, retained for record
 */
export const weeklyStatuses = ["draft", "published", "archived"] as const;

export type WeeklyStatus = (typeof weeklyStatuses)[number];
