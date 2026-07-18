import * as repo from "./ads.repo.firestore";
import type { CreateAdInput, UpdateAdInput } from "./ads.schema";
import type { AdStatus, PlacementKey, TargetDevice } from "./ads.types";

// ─── Public ───────────────────────────────────────────────────────────────────

export function serveAds(placement: PlacementKey, device?: TargetDevice) {
  return repo.serveAds(placement, device);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function listAds(filters?: {
  status?: AdStatus;
  placement?: PlacementKey;
  clientId?: string;
}) {
  return repo.listAds(filters);
}

export function findAdById(id: string) {
  return repo.findAdById(id);
}

export function createAd(input: CreateAdInput, createdBy: string) {
  return repo.createAd(input, createdBy);
}

export function updateAd(id: string, input: UpdateAdInput) {
  return repo.updateAd(id, input);
}

export function publishAd(id: string) {
  return repo.publishAd(id);
}

export function unpublishAd(id: string) {
  return repo.unpublishAd(id);
}

export function archiveAd(id: string) {
  return repo.archiveAd(id);
}

export function deleteAd(id: string) {
  return repo.deleteAd(id);
}
