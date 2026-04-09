export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>; // field-level validation errors
}

export interface Magazine {
  id: string;
  title: string;
  issueNumber: number;
  slug: string;
  publishedAt: string;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
  flipbookUrl: string;
  author: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type MagazineListResponse = ApiResponse<Magazine[]>;
export type MagazineResponse = ApiResponse<Magazine>;
export type MagazineSearchResponse = PaginatedResponse<Magazine>;

export type CreateMagazineInput = {
  title: string;
  issueNumber: number;
  slug: string;
  publishedAt: string;
  summary: string;
  coverImageUrl: string;
  coverImageAlt: string;
  flipbookUrl: string;
  author: string;
};
