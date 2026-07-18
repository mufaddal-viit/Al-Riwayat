import {
  BarChart3,
  Database,
  FileText,
  Inbox,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

/** A single admin section. `key` doubles as the active-view identifier. */
export interface AdminNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Optional grouping heading rendered above the item. */
  group?: string;
}

/**
 * Single source of truth for the admin sidebar. Adding a section is one entry
 * here plus its view in the page switch — order and grouping are data-driven.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { key: "overview", label: "Overview", icon: BarChart3, group: "General" },
  { key: "contributions", label: "Contributions", icon: FileText, group: "Content" },
  { key: "weekly", label: "Weekly Riwayat", icon: Newspaper, group: "Content" },
  { key: "comments", label: "Comments", icon: MessageSquare, group: "Content" },
  { key: "ads", label: "Ads", icon: Megaphone, group: "Advertising" },
  { key: "clients", label: "Clients", icon: Users, group: "Advertising" },
  { key: "engagement", label: "Engagement", icon: Sparkles, group: "Audience" },
  { key: "contacts", label: "Contacts", icon: Inbox, group: "Audience" },
  { key: "newsletter", label: "Newsletter", icon: Mail, group: "Audience" },
  { key: "data", label: "Data", icon: Database, group: "System" },
];
