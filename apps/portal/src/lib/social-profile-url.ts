const PLATFORM_PROFILE_URL: Record<string, (handle: string) => string> = {
  instagram: (handle) => `https://instagram.com/${handle}`,
  youtube: (handle) => `https://youtube.com/@${handle}`,
  twitter: (handle) => `https://x.com/${handle}`,
  x: (handle) => `https://x.com/${handle}`,
  linkedin: (handle) => `https://linkedin.com/in/${handle}`,
};

/** A creator's linked profile only ever stores a bare handle, not a full
 * URL (unlike a brand's free-form social links, which store the URL
 * directly) — build the profile link client-side. Returns null for a
 * platform we don't know how to link to. */
export function linkedProfileUrl(platform: string, handle: string): string | null {
  const build = PLATFORM_PROFILE_URL[platform.toLowerCase()];
  return build ? build(handle.replace(/^@/, "")) : null;
}
