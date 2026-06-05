const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Turn stored upload paths or API URLs into a src the browser can load. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return "";

  const trimmed = url.trim();
  const uploadsIndex = trimmed.indexOf("/uploads/");

  if (uploadsIndex >= 0) {
    const path = trimmed.slice(uploadsIndex);
    if (import.meta.env.DEV) {
      return path;
    }
    return `${API_BASE.replace(/\/$/, "")}${path}`;
  }

  if (trimmed.startsWith("/")) {
    if (import.meta.env.DEV) return trimmed;
    return `${API_BASE.replace(/\/$/, "")}${trimmed}`;
  }

  return trimmed;
}

/** Prefer relative /uploads/... path for DB storage. */
export function normalizeUploadUrl(
  response: { url: string; path?: string },
): string {
  return response.path?.trim() || response.url.trim();
}
