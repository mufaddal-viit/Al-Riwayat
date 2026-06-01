import type { ApiResponse } from "@/types/api";

export type AdminJsonValue =
  | string
  | number
  | boolean
  | null
  | AdminJsonValue[]
  | { [key: string]: AdminJsonValue };

export interface AdminDashboardMetric {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export interface AdminFirestoreDocument {
  id: string;
  path: string;
  data: Record<string, AdminJsonValue>;
  fields: string[];
  primaryDate: string | null;
}

export interface AdminFirestoreCollection {
  id: string;
  label: string;
  path: string;
  total: number;
  latestAt: string | null;
  fields: string[];
  documents: AdminFirestoreDocument[];
}

export interface AdminDashboardData {
  generatedAt: string;
  metrics: AdminDashboardMetric[];
  collections: AdminFirestoreCollection[];
}

export type AdminDashboardResponse = ApiResponse<AdminDashboardData>;
