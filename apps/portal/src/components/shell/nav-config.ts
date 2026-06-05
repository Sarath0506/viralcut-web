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

const agencyNavItems: PortalNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/brands",
    label: "Brands",
    icon: Building2,
    matchNested: true,
  },
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
  {
    href: "/settings/brand",
    label: "Settings",
    icon: Settings,
  },
];

export function getNavForRole(role: Portal): PortalNavItem[] {
  return role === "agency" ? agencyNavItems : brandNavItems;
}

export function resolvePortalTitle(pathname: string, role: Portal): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/brands") return "Brands";
  if (pathname === "/brands/new") return "New brand";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname.startsWith("/campaigns/new")) return "Create campaign";
  if (/^\/campaigns\/[^/]+$/.test(pathname)) return "Campaign";
  if (pathname === "/submissions") return "Submissions";
  if (/^\/submissions\/[^/]+$/.test(pathname)) return "Review submission";
  if (pathname === "/analytics") return "Analytics";
  if (pathname === "/billing") return "Billing";
  if (pathname === "/settings/brand") return "Settings";
  return role === "agency" ? "Agency Portal" : "Brand Portal";
}

export function portalSidebarLabel(role: Portal): string {
  return role === "agency" ? "Agency Portal" : "Brand Portal";
}

export function isNavItemActive(
  pathname: string,
  item: PortalNavItem,
): boolean {
  if (pathname === item.href) return true;
  if (!item.matchNested) return false;
  return pathname.startsWith(`${item.href}/`);
}

/** @deprecated use getNavForRole */
export const portalNavItems = brandNavItems;
