import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { campaignToDraft } from "@/features/campaigns/lib/campaign-from-api";
import type { ReferenceAsset } from "@/features/campaigns/lib/reference-assets";
import type { SourceAsset } from "@/features/campaigns/lib/source-assets";
import { getWizardPaths, type WizardPaths } from "@/features/campaigns/lib/wizard-paths";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export type CampaignDraft = {
  campaignId: string | null;
  coverImageUrl: string;
  title: string;
  category: string;
  platforms: string[];
  startDate: string;
  briefHook: string;
  doRules: string;
  avoidRules: string;
  sourceAssets: SourceAsset[];
  referenceAssets: ReferenceAsset[];
  brief: string;
  productUrl: string;
  ratePer1kRupees: string;
  maxPayoutRupees: string;
  budgetRupees: string;
};

const empty: CampaignDraft = {
  campaignId: null,
  coverImageUrl: "",
  title: "",
  category: "",
  platforms: ["instagram_reel"],
  startDate: "",
  briefHook: "",
  doRules: "",
  avoidRules: "",
  sourceAssets: [],
  referenceAssets: [],
  brief: "",
  productUrl: "",
  ratePer1kRupees: "50",
  maxPayoutRupees: "50000",
  budgetRupees: "100000",
};

const STORAGE_KEY = "viralcut_campaign_draft";

function normalizePlatformId(id: string): string {
  return id === "instagram_reels" ? "instagram_reel" : id;
}

function hydrateDraft(raw: string | null): CampaignDraft {
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<CampaignDraft>;
    const merged: CampaignDraft = {
      ...empty,
      ...parsed,
      platforms: (parsed.platforms ?? empty.platforms).map(normalizePlatformId),
      sourceAssets: Array.isArray(parsed.sourceAssets)
        ? parsed.sourceAssets.map((asset) => ({
            id: asset.id ?? crypto.randomUUID(),
            type: asset.type === "youtube" ? "youtube" : "drive",
            url: asset.url ?? "",
            label: asset.label ?? "",
          }))
        : [],
      referenceAssets: Array.isArray(parsed.referenceAssets)
        ? parsed.referenceAssets
            .filter((a) => a.type === "image" || a.type === "video")
            .map((asset) => ({
              id: asset.id ?? crypto.randomUUID(),
              type: asset.type as "image" | "video",
              url: asset.url ?? "",
              label: asset.label ?? "",
            }))
        : [],
    };
    return merged;
  } catch {
    return empty;
  }
}

type WizardContext = {
  draft: CampaignDraft;
  paths: WizardPaths;
  loading: boolean;
  loadError: string | null;
  update: (patch: Partial<CampaignDraft>) => void;
  reset: () => void;
};

const WizardContext = createContext<WizardContext | null>(null);

export function CampaignWizardProvider({
  editCampaignId,
  children,
}: {
  editCampaignId?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    editCampaignId ? empty : hydrateDraft(sessionStorage.getItem(STORAGE_KEY)),
  );
  const [loading, setLoading] = useState(Boolean(editCampaignId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const paths = useMemo(
    () => getWizardPaths(editCampaignId ?? draft.campaignId),
    [editCampaignId, draft.campaignId],
  );

  useEffect(() => {
    if (!editCampaignId) return;

    let cancelled = false;
    async function loadCampaign() {
      const campaignId = editCampaignId as string;
      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setLoadError("Your session expired. Please log in again.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const campaign = await brandApi.campaigns.get(token, campaignId);
        if (campaign.status !== "draft") {
          if (!cancelled) {
            navigate(`/campaigns/${campaignId}`, { replace: true });
          }
          return;
        }
        if (!cancelled) {
          const next = campaignToDraft(campaign);
          setDraft(next);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Could not load campaign draft.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCampaign();
    return () => {
      cancelled = true;
    };
  }, [editCampaignId, getToken, navigate]);

  const update = useCallback((patch: Partial<CampaignDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setDraft(empty);
  }, []);

  const value = useMemo(
    () => ({ draft, paths, loading, loadError, update, reset }),
    [draft, paths, loading, loadError, update, reset],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useCampaignWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useCampaignWizard requires CampaignWizardProvider");
  }
  return ctx;
}
