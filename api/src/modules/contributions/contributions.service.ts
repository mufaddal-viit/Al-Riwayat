import * as repo from "./contributions.repo.firestore";
import type {
  PublishContributionInput,
  UpdateContributionInput,
} from "./contributions.schema";
import type { ContributionStatus } from "./contributions.types";

// ─── Public reads ─────────────────────────────────────────────────────────────

export function listPublishedContributions() {
  return repo.listPublishedContributions();
}

export function findPublishedContributionBySlug(slug: string) {
  return repo.findPublishedContributionBySlug(slug);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function listAdminContributions(status?: ContributionStatus) {
  return repo.listAdminContributions(status);
}

export function findAdminContributionById(id: string) {
  return repo.findAdminContributionById(id);
}

export function updateContribution(id: string, input: UpdateContributionInput) {
  return repo.updateContribution(id, input);
}

export function publishContribution(id: string, input: PublishContributionInput) {
  return repo.publishContribution(id, input);
}

export function unpublishContribution(id: string) {
  return repo.unpublishContribution(id);
}

export function rejectContribution(id: string) {
  return repo.rejectContribution(id);
}

export function deleteContribution(id: string) {
  return repo.deleteContribution(id);
}
