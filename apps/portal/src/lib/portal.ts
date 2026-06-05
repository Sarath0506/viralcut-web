export type Portal = "brand" | "agency";

export function parsePortal(value: string | null | undefined): Portal {
  return value === "agency" ? "agency" : "brand";
}

export function isAgencyRole(role: string | undefined | null): boolean {
  return role === "agency";
}

export function selectedBrandStorageKey(role: string | undefined | null): string {
  return isAgencyRole(role)
    ? "viralcut.agency.selectedBrandProfileId"
    : "viralcut.brand.selectedBrandProfileId";
}
