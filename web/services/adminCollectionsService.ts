export type AdminJsonValue =
  | string
  | number
  | boolean
  | null
  | AdminJsonValue[]
  | { [key: string]: AdminJsonValue };

export interface AdminCollectionDoc {
  id: string;
  data: Record<string, AdminJsonValue>;
}

export type AdminResource =
  | "comments"
  | "contacts"
  | "newsletter"
  | "reactions"
  | "engagement";

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }
  return payload.data as T;
}

export async function listResource(
  resource: AdminResource,
): Promise<AdminCollectionDoc[]> {
  const response = await fetch(`/api/admin/collections/${resource}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdminCollectionDoc[]>(response);
}

export async function transitionResource(
  resource: AdminResource,
  id: string,
  action: string,
): Promise<AdminCollectionDoc> {
  const response = await fetch(
    `/api/admin/collections/${resource}/${id}/${action}`,
    { method: "PATCH" },
  );
  return parse<AdminCollectionDoc>(response);
}

export async function deleteResource(
  resource: AdminResource,
  id: string,
): Promise<AdminCollectionDoc> {
  const response = await fetch(`/api/admin/collections/${resource}/${id}`, {
    method: "DELETE",
  });
  return parse<AdminCollectionDoc>(response);
}
