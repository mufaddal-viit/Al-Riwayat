import * as repo from "./clients.repo.firestore";
import type { CreateClientInput, UpdateClientInput } from "./clients.schema";
import type { ClientStatus, ClientTier } from "./clients.types";

export function listClients(filters?: {
  status?: ClientStatus;
  tier?: ClientTier;
}) {
  return repo.listClients(filters);
}

export function findClientById(id: string) {
  return repo.findClientById(id);
}

export function createClient(input: CreateClientInput, createdBy: string) {
  return repo.createClient(input, createdBy);
}

export function updateClient(id: string, input: UpdateClientInput) {
  return repo.updateClient(id, input);
}

export function archiveClient(id: string) {
  return repo.archiveClient(id);
}

export function deleteClient(id: string) {
  return repo.deleteClient(id);
}
