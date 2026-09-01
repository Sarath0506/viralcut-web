const PLATFORM_PROFILE_URL: Record<string, (handle: string) => string> = {
  instagram: (handle) => `https://instagram.com/${handle}`,
  youtube: (handle) => `https://youtube.com/@${handle}`,
  twitter: (handle) => `https://x.com/${handle}`,
  x: (handle) => `https://x.com/${handle}`,
  linkedin: (handle) => `https://linkedin.com/in/${handle}`,
};

/** A CreatorProfile's own `platform`/`handle` is just the persona the
 * creator picked inside the app (e.g. "demon") — not a real social media
 * username, so it must never be used to build a profile link. The actual
 * account they connected lives in that profile's `socialLinks` map, keyed
 * by platform, and the mobile "connect account" flow accepts either a bare
 * "@handle" or a full profile URL for that value — normalize both here.
 * Returns null when nothing is connected for this platform, or it's a
 * platform we don't know how to link to. */
export function connectedSocialUrl(
  platform: string,
  socialLinks: Record<string, string> | null | undefined,
): string | null {
  const handleOrUrl = socialLinks?.[platform.toLowerCase()]?.trim();
  if (!handleOrUrl) return null;
  if (/^https?:\/\//i.test(handleOrUrl)) return handleOrUrl;

  const build = PLATFORM_PROFILE_URL[platform.toLowerCase()];
  return build ? build(handleOrUrl.replace(/^@/, "")) : null;
}
