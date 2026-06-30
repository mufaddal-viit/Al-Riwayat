export type WeeklyStatus = "draft" | "published" | "archived";

export interface AdminWeekly {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  excerpt: string;
  body: string;
  readingTime: number;
  weekOf: string | null;
  tags: string[];
  status: WeeklyStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyPayload {
  title: string;
  slug?: string;
  subtitle?: string;
  author?: string;
  excerpt: string;
  body: string;
  readingTime: number;
  weekOf?: string;
  tags?: string[];
}

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

export async function listAdminWeekly(
  status?: WeeklyStatus,
): Promise<AdminWeekly[]> {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(`/api/admin/weekly${query}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  return parse<AdminWeekly[]>(response);
}

export async function createWeekly(payload: WeeklyPayload): Promise<AdminWeekly> {
  const response = await fetch(`/api/admin/weekly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminWeekly>(response);
}

export async function updateWeekly(
  id: string,
  payload: Partial<WeeklyPayload>,
): Promise<AdminWeekly> {
  const response = await fetch(`/api/admin/weekly/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<AdminWeekly>(response);
}

async function lifecycle(
  id: string,
  action: "publish" | "unpublish" | "archive",
): Promise<AdminWeekly> {
  const response = await fetch(`/api/admin/weekly/${id}/${action}`, {
    method: "PATCH",
  });
  return parse<AdminWeekly>(response);
}

export const publishWeekly = (id: string) => lifecycle(id, "publish");
export const unpublishWeekly = (id: string) => lifecycle(id, "unpublish");
export const archiveWeekly = (id: string) => lifecycle(id, "archive");

export async function deleteWeekly(id: string): Promise<AdminWeekly> {
  const response = await fetch(`/api/admin/weekly/${id}`, { method: "DELETE" });
  return parse<AdminWeekly>(response);
}
