export type Portal = "brand" | "admin";

export function parsePortal(value: string | null | undefined): Portal {
  return value === "admin" ? "admin" : "brand";
}

export function portalFromRole(role: string | undefined | null): Portal {
  return role === "admin" ? "admin" : "brand";
}

export function dashboardPathForRole(role: string | undefined | null): string {
  return role === "admin" ? "/admin/dashboard" : "/dashboard";
}
