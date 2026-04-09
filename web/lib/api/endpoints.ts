export const ENDPOINTS = {
  // Magazine Reader (public)
  magazine: {
    featured: "/magazine/issues/featured",
    list: "/magazine/issues",
    byId: (id: string) => `/magazine/issue/${id}`,
    search: (q: string) => `/magazine/issues/search?q=${encodeURIComponent(q)}`,
  },
  // Magazine Admin
  "magazine.admin": {
    issues: {
      list: "/admin/magazine/issues",
      create: "/admin/magazine/issues",
      byId: (id: string) => `/admin/magazine/issues/${id}`,
      update: (id: string) => `/admin/magazine/issues/${id}`,
      replace: (id: string) => `/admin/magazine/issues/${id}`,
      publish: (id: string) => `/admin/magazine/issues/${id}/publish`,
      unpublish: (id: string) => `/admin/magazine/issues/${id}/unpublish`,
      archive: (id: string) => `/admin/magazine/issues/${id}/archive`,
      duplicate: (id: string) => `/admin/magazine/issues/${id}/duplicate`,
    },
  },
  // Forms
  contact: {
    submit: "/contact",
  },
  newsletter: {
    subscribe: "/newsletter",
  },
  // Utils
  health: "/health",
  docs: "/docs/magazine.json",
} as const;

export type ApiEndpoints = typeof ENDPOINTS;
