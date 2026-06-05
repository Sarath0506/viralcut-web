export type ReferenceAssetType = "image" | "video";

export type ReferenceAsset = {
  id: string;
  type: ReferenceAssetType;
  url: string;
  label: string;
};

export function createReferenceAsset(
  partial?: Partial<Pick<ReferenceAsset, "type" | "url" | "label">>,
): ReferenceAsset {
  return {
    id: crypto.randomUUID(),
    type: partial?.type ?? "image",
    url: partial?.url ?? "",
    label: partial?.label ?? "",
  };
}

export function parseReferenceAssetsFromApi(
  raw: unknown,
): ReferenceAsset[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { type?: string; url?: string; label?: string } =>
        typeof item === "object" && item !== null,
    )
    .filter((item) => item.type === "image" || item.type === "video")
    .map((item) =>
      createReferenceAsset({
        type: item.type as ReferenceAssetType,
        url: item.url ?? "",
        label: item.label ?? "",
      }),
    );
}

export function toApiReferenceAssets(assets: ReferenceAsset[]) {
  return assets
    .map((asset) => ({
      type: asset.type,
      url: asset.url.trim(),
      label: asset.label.trim() || undefined,
    }))
    .filter((asset) => asset.url.length > 0);
}
