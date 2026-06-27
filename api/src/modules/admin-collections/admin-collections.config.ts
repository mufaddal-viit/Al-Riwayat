/**
 * Per-resource moderation config for the admin dashboard. Each resource maps to
 * a Firestore collection and declares which soft-status transitions it supports
 * (applied as a field update) and whether hard delete is allowed.
 *
 * Soft-where-possible policy:
 *   - comments    → status field (PENDING / APPROVED / SPAM) + hard delete
 *   - contacts    → status field (new / read / archived) + hard delete
 *   - newsletter  → isActive flag (unsubscribe) + hard delete
 *   - reactions   → hard delete only (no meaningful soft state)
 *   - engagement  → hard delete only (lead record)
 */

export interface StatusAction {
  /** Action slug used in the route, e.g. "approve". */
  action: string;
  /** Field to set. */
  field: string;
  /** Value to set the field to. */
  value: string | boolean;
}

export interface ResourceConfig {
  /** Firestore collection name. */
  collection: string;
  /** Soft transitions, keyed by action slug. */
  statusActions: StatusAction[];
  /** Whether DELETE is permitted. */
  allowDelete: boolean;
}

export const RESOURCES: Record<string, ResourceConfig> = {
  comments: {
    collection: "comments",
    statusActions: [
      { action: "approve", field: "status", value: "APPROVED" },
      { action: "spam", field: "status", value: "SPAM" },
      { action: "pending", field: "status", value: "PENDING" },
    ],
    allowDelete: true,
  },
  contacts: {
    collection: "contacts",
    statusActions: [
      { action: "read", field: "status", value: "read" },
      { action: "unread", field: "status", value: "new" },
      { action: "archive", field: "status", value: "archived" },
    ],
    allowDelete: true,
  },
  newsletter: {
    collection: "newsletter",
    statusActions: [
      { action: "unsubscribe", field: "isActive", value: false },
      { action: "resubscribe", field: "isActive", value: true },
    ],
    allowDelete: true,
  },
  reactions: {
    collection: "page_reactions",
    statusActions: [],
    allowDelete: true,
  },
  engagement: {
    collection: "engagement_submissions",
    statusActions: [],
    allowDelete: true,
  },
};

export function resourceConfig(resource: string): ResourceConfig | undefined {
  return RESOURCES[resource];
}
