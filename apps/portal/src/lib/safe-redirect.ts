/** Relative in-app paths only — blocks open redirects. */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/dashboard";
  const decoded = decodeURIComponent(next);
  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/dashboard";
  }
  return decoded;
}
