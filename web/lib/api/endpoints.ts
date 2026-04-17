export const ENDPOINTS = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    register:           "/auth/register",
    login:              "/auth/login",
    google:             "/auth/google",
    logout:             "/auth/logout",
    refresh:            "/auth/refresh",
    me:                 "/auth/me",
    updateProfile:      "/auth/me",
    changePassword:     "/auth/me/password",
    deleteAccount:      "/auth/me",
    verifyEmail:        "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    forgotPassword:     "/auth/forgot-password",
    resetPassword:      "/auth/reset-password",
  },

  // ─── Magazine Reader (public) ──────────────────────────────────────────────
  magazine: {
    featured: "/magazine/issues/featured",
    list:     "/magazine/issues",
    byId:     (id: string) => `/magazine/issue/${id}`,
    search:   (q: string) => `/magazine/issues/search?q=${encodeURIComponent(q)}`,
  },

  // ─── Magazine Admin ────────────────────────────────────────────────────────
  "magazine.admin": {
    issues: {
      list:      "/admin/magazine/issues",
      create:    "/admin/magazine/issues",
      byId:      (id: string) => `/admin/magazine/issues/${id}`,
      update:    (id: string) => `/admin/magazine/issues/${id}`,
      replace:   (id: string) => `/admin/magazine/issues/${id}`,
      publish:   (id: string) => `/admin/magazine/issues/${id}/publish`,
      unpublish: (id: string) => `/admin/magazine/issues/${id}/unpublish`,
      archive:   (id: string) => `/admin/magazine/issues/${id}/archive`,
      duplicate: (id: string) => `/admin/magazine/issues/${id}/duplicate`,
    },
  },

  // ─── Admin Users ───────────────────────────────────────────────────────────
  "admin.users": {
    list:   "/admin/users",
    byId:   (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    delete: (id: string) => `/admin/users/${id}`,
  },

  // ─── Forms ─────────────────────────────────────────────────────────────────
  contact:    { submit:    "/contact" },
  newsletter: { subscribe: "/newsletter" },

  // ─── Comments (public) ────────────────────────────────────────────────────
  comments: {
    list:   "/comments",
    create: "/comments",
  },

  // ─── Comments (admin) ─────────────────────────────────────────────────────
  "admin.comments": {
    approve: (id: string) => `/admin/comments/${id}/approve`,
    spam:    (id: string) => `/admin/comments/${id}/spam`,
    delete:  (id: string) => `/admin/comments/${id}`,
  },

  // ─── Utils ─────────────────────────────────────────────────────────────────
  health: "/health",
  docs:   "/docs/magazine.json",
} as const;

export type ApiEndpoints = typeof ENDPOINTS;
