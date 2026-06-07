import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
} from "lucide-react";

import type { Portal } from "@/lib/portal";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchNested?: boolean;
};

const brandNavItems: PortalNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: Megaphone,
    matchNested: true,
  },
  {
    href: "/submissions",
    label: "Submissions",
    icon: Inbox,
    matchNested: true,
  },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  {
    href: "/settings/brand",
    label: "Settings",
    icon: Settings,
  },
];

const adminNavItems: PortalNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/brands", label: "Brands", icon: Building2, matchNested: true },
  {
    href: "/admin/campaigns",
    label: "Campaigns",
    icon: Megaphone,
    matchNested: true,
  },
  {
    href: "/admin/submissions",
    label: "Submissions",
    icon: Inbox,
    matchNested: true,
  },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function getNavForRole(role: Portal): PortalNavItem[] {
  return role === "admin" ? adminNavItems : brandNavItems;
}

export function resolvePortalTitle(pathname: string, role: Portal): string {
  if (pathname === "/dashboard" || pathname === "/admin/dashboard") {
    return "Dashboard";
  }
  if (pathname === "/admin/brands") return "Brands";
  if (pathname === "/admin/campaigns") return "Campaigns";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname.startsWith("/campaigns/new") || pathname.startsWith("/admin/campaigns/new")) {
    return "Create campaign";
  }
  if (/^\/campaigns\/[^/]+$/.test(pathname) || /^\/admin\/campaigns\/[^/]+$/.test(pathname)) {
    return "Campaign";
  }
  if (pathname === "/submissions" || pathname === "/admin/submissions") {
    return "Submissions";
  }
  if (/^\/submissions\/[^/]+$/.test(pathname) || /^\/admin\/submissions\/[^/]+$/.test(pathname)) {
    return "Review submission";
  }
  if (pathname === "/analytics" || pathname === "/admin/analytics") return "Analytics";
  if (pathname === "/billing") return "Billing";
  if (pathname === "/settings/brand") return "Settings";
  return role === "admin" ? "Admin Portal" : "Brand Portal";
}

export function portalSidebarLabel(role: Portal): string {
  return role === "admin" ? "Admin Portal" : "Brand Portal";
}

export function isNavItemActive(
  pathname: string,
  item: PortalNavItem,
): boolean {
  if (pathname === item.href) return true;
  if (!item.matchNested) return false;
  return pathname.startsWith(`${item.href}/`);
}
