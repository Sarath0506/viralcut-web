import type { AuthResponse } from "./api";

const STORAGE_KEY = "halchal.auth";

export function getStoredAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: AuthResponse): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.tokens.accessToken ?? null;
}
