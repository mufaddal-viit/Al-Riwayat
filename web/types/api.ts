// ─── Shared envelope types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
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
  errors?: Record<string, string[]>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "CUSTOMER";

/** User shape returned from /auth/me and /auth/login — never contains passwordHash */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export type LoginResponse    = ApiResponse<{ accessToken: string; user: AuthUser }>;
export type MeResponse       = ApiResponse<{ user: AuthUser }>;
export type MessageResponse  = ApiResponse<never> & { message: string };

// ─── Contact / Newsletter ─────────────────────────────────────────────────────

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

export type ContactResponse    = ApiResponse<{ success: boolean }>;
export type NewsletterResponse = ApiResponse<{ success: boolean; message?: string }>;

// ─── Magazine ─────────────────────────────────────────────────────────────────

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

export type MagazineListResponse   = ApiResponse<Magazine[]>;
export type MagazineResponse       = ApiResponse<Magazine>;
export type MagazineSearchResponse = PaginatedResponse<Magazine>;

export type CreateMagazineInput = Omit<Magazine, "id" | "status" | "createdAt" | "updatedAt">;

// ─── Contributions ──────────────────────────────────────────────────────────

export type ContributionCategory = "Story" | "Poetry" | "Reflection" | "Art";

/** A published reader submission showcased on /contributions. */
export interface Contribution {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: ContributionCategory;
  publishedAt: string;
  /** Short preview shown on cards. */
  excerpt: string;
  /** Full piece — plain text / lightweight markdown, rendered paragraph-wise. */
  body: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featured?: boolean;
}

export type ContributionListResponse = ApiResponse<Contribution[]>;
export type ContributionResponse     = ApiResponse<Contribution>;

// ─── Weekly Riwayat ─────────────────────────────────────────────────────────

/** A short, admin-authored weekly article published on /weekly-riwayat. */
export interface WeeklyArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  excerpt: string;
  /** Full body — Markdown. */
  body: string;
  readingTime: number;
  weekOf: string | null;
  tags: string[];
  publishedAt: string | null;
}

export type WeeklyListResponse = ApiResponse<WeeklyArticle[]>;
export type WeeklyResponse     = ApiResponse<WeeklyArticle>;
