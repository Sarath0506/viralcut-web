import { HardDrive, Trash2, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSourceAsset,
  type SourceAsset,
  type SourceAssetType,
} from "@/features/campaigns/lib/source-assets";
const typeOptions: {
  value: SourceAssetType;
  label: string;
  icon: typeof HardDrive;
}[] = [
  { value: "drive", label: "Drive link", icon: HardDrive },
  { value: "youtube", label: "YouTube link", icon: Youtube },
];

type SourceAssetsEditorProps = {
  assets: SourceAsset[];
  onChange: (assets: SourceAsset[]) => void;
};

export function SourceAssetsEditor({ assets, onChange }: SourceAssetsEditorProps) {
  const updateAsset = (id: string, patch: Partial<SourceAsset>) => {
    onChange(
      assets.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)),
    );
  };

  const removeAsset = (id: string) => {
    onChange(assets.filter((asset) => asset.id !== id));
  };

  const addAsset = (type: SourceAssetType) => {
    onChange([...assets, createSourceAsset({ type })]);
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
        <p className="text-xs text-muted">
          Add Google Drive or YouTube links creators can use as source material.
        </p>
      ) : null}

      {assets.map((asset) => {
        const option = typeOptions.find((o) => o.value === asset.type);
        const Icon = option?.icon ?? HardDrive;
        return (
          <div
            key={asset.id}
            className="rounded-xl border border-border bg-surface p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Icon className="h-3.5 w-3.5" />
                {option?.label ?? "Link"}
              </span>
              <button
                type="button"
                className="rounded p-1 text-muted hover:bg-surface-variant hover:text-foreground"
                onClick={() => removeAsset(asset.id)}
                aria-label="Remove source asset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted">URL</Label>
                <Input
                  value={asset.url}
                  placeholder={
                    asset.type === "youtube"
                      ? "https://youtube.com/..."
                      : "https://drive.google.com/..."
                  }
                  onChange={(e) => updateAsset(asset.id, { url: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted">Label (optional)</Label>
                <Input
                  value={asset.label}
                  onChange={(e) => updateAsset(asset.id, { label: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
