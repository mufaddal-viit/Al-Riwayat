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
    search:   (q: string, opts?: { page?: number; limit?: number }) => {
      const params = new URLSearchParams({ q });
      if (opts?.page != null) params.set("page", String(opts.page));
      if (opts?.limit != null) params.set("limit", String(opts.limit));
      return `/magazine/issues/search?${params.toString()}`;
    },
  },

  // ─── Contributions (public) ───────────────────────────────────────────────
  contributions: {
    list:   "/contributions",
    byId:   (slug: string) => `/contributions/${slug}`,
  },

  // ─── Weekly Riwayat (public) ──────────────────────────────────────────────
  weekly: {
    list: "/weekly",
    byId: (slug: string) => `/weekly/${slug}`,
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

  "admin.dashboard": {
    get: "/admin/dashboard",
  },

  // ─── Forms ─────────────────────────────────────────────────────────────────
  contact:     { submit:    "/contact" },
  engagement:  { submit:    "/engagement" },
  newsletter:  { subscribe: "/newsletter" },
  submissions: { submit:    "/submissions" },

  // ─── Me (authenticated self-service profile) ──────────────────────────────
  me: {
    get:             "/me",
    update:          "/me",
    addBookmark:     (slug: string) => `/me/bookmarks/${slug}`,
    removeBookmark:  (slug: string) => `/me/bookmarks/${slug}`,
    addFavourite:    (slug: string) => `/me/favourites/${slug}`,
    removeFavourite: (slug: string) => `/me/favourites/${slug}`,
  },

  // ─── Comments (public) ────────────────────────────────────────────────────
  comments: {
    list:   "/comments",
    create: "/comments",
  },

  // ─── Page reactions (public, anonymous) ───────────────────────────────────
  pageReactions: {
    counts: "/page-reactions",
    own:    "/page-reactions/own",
    set:    "/page-reactions",
    clear:  "/page-reactions",
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
