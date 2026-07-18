import type { Request, Response } from "express";

import type {
  ClientIdParams,
  ClientListQuery,
  CreateClientInput,
  UpdateClientInput,
} from "./clients.schema";
import {
  archiveClient as archiveClientRecord,
  createClient as createClientRecord,
  deleteClient as deleteClientRecord,
  findClientById,
  listClients,
  updateClient as updateClientRecord,
} from "./clients.service";

const notFound = (res: Response) =>
  res.status(404).json({ success: false, message: "Client not found." });

/** Admin email forwarded by the BFF alongside the shared secret. */
function actorEmail(req: Request): string {
  return req.header("x-admin-email") ?? "";
}

export async function listClientsController(
  req: Request<Record<string, never>, unknown, unknown, ClientListQuery>,
  res: Response,
) {
  try {
    const clients = await listClients({
      status: req.query.status,
      tier: req.query.tier,
    });
    return res.status(200).json({ success: true, data: clients });
  } catch (error) {
    console.error("Failed to list clients.", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load clients right now." });
  }
}

export async function getClientController(
  req: Request<ClientIdParams>,
  res: Response,
) {
  try {
    const client = await findClientById(req.params.id);
    if (!client) return notFound(res);
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error(`Failed to fetch client "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load the client right now." });
  }
}

export async function createClientController(
  req: Request<Record<string, never>, unknown, CreateClientInput>,
  res: Response,
) {
  try {
    const client = await createClientRecord(req.body, actorEmail(req));
    return res.status(201).json({ success: true, data: client });
  } catch (error) {
    console.error("Failed to create client.", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to create the client right now." });
  }
}

export async function updateClientController(
  req: Request<ClientIdParams, unknown, UpdateClientInput>,
  res: Response,
) {
  try {
    const client = await updateClientRecord(req.params.id, req.body);
    if (!client) return notFound(res);
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error(`Failed to update client "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update the client right now." });
  }
}

export async function archiveClientController(
  req: Request<ClientIdParams>,
  res: Response,
) {
  try {
    const client = await archiveClientRecord(req.params.id);
    if (!client) return notFound(res);
    return res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error(`Failed to archive client "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to archive the client." });
  }
}

export async function deleteClientController(
  req: Request<ClientIdParams>,
  res: Response,
) {
  try {
    const client = await deleteClientRecord(req.params.id);
    if (!client) return notFound(res);
    return res
      .status(200)
      .json({ success: true, message: "Client deleted.", data: client });
  } catch (error) {
    console.error(`Failed to delete client "${req.params.id}".`, error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete the client right now." });
  }
}
