const PLATFORM_LABELS: Record<string, string> = {
  instagram_reel: "Instagram Reel",
  instagram_reels: "Instagram Reel",
  instagram_post: "Instagram Post",
  youtube_shorts: "YouTube Shorts",
  twitter_tweet: "Twitter Tweet",
};

export function formatPlatformLabel(platformId: string): string {
  return PLATFORM_LABELS[platformId] ?? platformId.replaceAll("_", " ");
}

export function formatPlatformList(platformIds: string[]): string {
  return platformIds.map(formatPlatformLabel).join(", ");
}

export const CAMPAIGN_PLATFORM_OPTIONS = [
  {
    group: "Instagram",
    options: [
      { value: "instagram_reel", label: "Reel" },
      { value: "instagram_post", label: "Post" },
    ],
  },
  {
    group: "YouTube",
    options: [{ value: "youtube_shorts", label: "Shorts" }],
  },
  {
    group: "Twitter",
    options: [{ value: "twitter_tweet", label: "Tweet" }],
  },
] as const;
