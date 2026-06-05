import { useState } from "react";
import { Image, Loader2, Trash2, Upload, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createReferenceAsset,
  type ReferenceAsset,
  type ReferenceAssetType,
} from "@/features/campaigns/lib/reference-assets";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const typeOptions: {
  value: ReferenceAssetType;
  label: string;
  icon: typeof Image;
}[] = [
  { value: "image", label: "Image (Post format)", icon: Image },
  { value: "video", label: "Video (Reel format)", icon: Video },
];

type ReferenceAssetsEditorProps = {
  assets: ReferenceAsset[];
  onChange: (assets: ReferenceAsset[]) => void;
  onUploadFile: (file: File, type: "image" | "video") => Promise<string>;
};

export function ReferenceAssetsEditor({
  assets,
  onChange,
  onUploadFile,
}: ReferenceAssetsEditorProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const updateAsset = (id: string, patch: Partial<ReferenceAsset>) => {
    onChange(
      assets.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)),
    );
  };

  const removeAsset = (id: string) => {
    onChange(assets.filter((asset) => asset.id !== id));
  };

  const addAsset = (type: ReferenceAssetType) => {
    onChange([...assets, createReferenceAsset({ type })]);
  };

  const onSelectFile = async (
    asset: ReferenceAsset,
    file: File | undefined,
  ): Promise<void> => {
    if (!file) return;
    setUploadingId(asset.id);
    try {
      const uploadedUrl = await onUploadFile(file, asset.type);
      updateAsset(asset.id, {
        url: uploadedUrl,
        label: asset.label.trim() ? asset.label : file.name,
      });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addAsset(option.value)}
          >
            <option.icon className="mr-1.5 h-3.5 w-3.5" />
            Add {option.label}
          </Button>
        ))}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-variant/30 px-4 py-6 text-center text-sm text-muted">
          Upload reference images (post format) or videos (reel format) for creators.
        </div>
      ) : (
        <ul className="space-y-2">
          {assets.map((asset) => {
            const option = typeOptions.find((o) => o.value === asset.type);
            return (
              <li
                key={asset.id}
                className="overflow-hidden rounded-xl border border-border bg-surface p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {option?.label ?? asset.type}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted hover:text-destructive"
                    onClick={() => removeAsset(asset.id)}
                    aria-label="Remove asset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted">File</Label>
                  <label
                    className={cn(
                      "flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-variant/40 px-3 text-sm text-foreground hover:bg-surface-variant",
                      uploadingId === asset.id && "opacity-70",
                    )}
                  >
                    {uploadingId === asset.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {asset.url ? "Replace file" : "Choose file"}
                      </>
                    )}
                    <input
                      type="file"
                      accept={asset.type === "image" ? "image/*" : "video/*"}
                      className="hidden"
                      disabled={uploadingId === asset.id}
                      onChange={(e) =>
                        void onSelectFile(asset, e.target.files?.[0])
                      }
                    />
                  </label>
                  {asset.url && asset.type === "image" ? (
                    <img
                      src={resolveMediaUrl(asset.url)}
                      alt={asset.label || "Reference preview"}
                      className="h-20 w-full rounded-lg border border-border object-cover"
                    />
                  ) : null}
                  {asset.url ? (
                    <p
                      className="min-w-0 truncate text-xs text-muted"
                      title={asset.url}
                    >
                      {asset.label.trim() ||
                        decodeURIComponent(
                          asset.url.split("/").pop()?.split("?")[0] ??
                            "Uploaded file",
                        )}
                    </p>
                  ) : (
                    <p className="text-xs text-muted">
                      Upload a {asset.type} file to attach it.
                    </p>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted">
                      Label (optional)
                    </Label>
                    <Input
                      value={asset.label}
                      onChange={(e) =>
                        updateAsset(asset.id, { label: e.target.value })
                      }
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
