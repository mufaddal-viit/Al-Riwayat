import * as repo from "./weekly.repo.firestore";
import type { CreateWeeklyInput, UpdateWeeklyInput } from "./weekly.schema";
import type { WeeklyStatus } from "./weekly.types";

// ─── Public reads ─────────────────────────────────────────────────────────────

export function listPublishedWeekly() {
  return repo.listPublishedWeekly();
}

export function findPublishedWeeklyBySlug(slug: string) {
  return repo.findPublishedWeeklyBySlug(slug);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function listAdminWeekly(status?: WeeklyStatus) {
  return repo.listAdminWeekly(status);
}

export function findAdminWeeklyById(id: string) {
  return repo.findAdminWeeklyById(id);
}

export function createWeekly(input: CreateWeeklyInput) {
  return repo.createWeekly(input);
}

export function updateWeekly(id: string, input: UpdateWeeklyInput) {
  return repo.updateWeekly(id, input);
}

export function publishWeekly(id: string) {
  return repo.publishWeekly(id);
}

export function unpublishWeekly(id: string) {
  return repo.unpublishWeekly(id);
}

export function archiveWeekly(id: string) {
  return repo.archiveWeekly(id);
}

export function deleteWeekly(id: string) {
  return repo.deleteWeekly(id);
}
