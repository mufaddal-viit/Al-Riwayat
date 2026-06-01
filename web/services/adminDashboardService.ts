import type {
  AdminDashboardData,
  AdminDashboardResponse,
} from "@/types/admin-dashboard";

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await fetch("/api/admin/dashboard", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const data = (await response.json()) as AdminDashboardResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? "Could not load the admin dashboard.");
  }

  return data.data;
}
