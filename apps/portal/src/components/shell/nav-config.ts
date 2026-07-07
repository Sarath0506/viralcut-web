import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserCog,
  Users,
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
  { href: "/admin/clippers", label: "Clippers", icon: Users, matchNested: true },
  {
    href: "/admin/campaigns",
    label: "Campaigns",
    icon: Megaphone,
    matchNested: true,
  },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/team", label: "Team", icon: UserCog },
];

const staffNavItems: PortalNavItem[] = [
  { href: "/staff/brands", label: "My Brands", icon: Building2, matchNested: true },
  { href: "/staff/tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/staff/profile", label: "Profile", icon: Settings },
];

export function getNavForRole(role: Portal): PortalNavItem[] {
  if (role === "admin") return adminNavItems;
  if (role === "staff") return staffNavItems;
  return brandNavItems;
}

export function resolvePortalTitle(pathname: string, role: Portal): string {
  if (pathname === "/dashboard" || pathname === "/admin/dashboard") {
    return "Dashboard";
  }
  if (pathname === "/admin/brands") return "Brands";
  if (pathname === "/admin/clippers") return "Clippers";
  if (pathname === "/admin/campaigns") return "Campaigns";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname.startsWith("/campaigns/new") || pathname.startsWith("/admin/campaigns/new")) {
    return "Create campaign";
  }
  if (/^\/campaigns\/[^/]+$/.test(pathname) || /^\/admin\/campaigns\/[^/]+$/.test(pathname)) {
    return "Campaign";
  }
  if (pathname === "/analytics" || pathname === "/admin/analytics") return "Analytics";
  if (pathname === "/billing") return "Billing";
  if (pathname === "/settings/brand") return "Settings";
  if (pathname === "/admin/profile" || pathname === "/staff/profile") return "My Profile";
  if (pathname === "/admin/team") return "Team";
  if (pathname === "/staff/tasks") return "My Tasks";
  return role === "admin" ? "Admin Portal" : "Brand Portal";
}

export function portalSidebarLabel(role: Portal): string {
  if (role === "admin") return "Admin Portal";
  if (role === "staff") return "Staff Portal";
  return "Brand Portal";
}

export function isNavItemActive(
  pathname: string,
  item: PortalNavItem,
): boolean {
  if (pathname === item.href) return true;
  if (!item.matchNested) return false;
  return pathname.startsWith(`${item.href}/`);
}
