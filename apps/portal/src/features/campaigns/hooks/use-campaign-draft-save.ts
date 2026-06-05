import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  buildCampaignBody,
  hasInvalidReferenceAssets,
} from "@/features/campaigns/lib/campaign-payload";
import { meetsMinimumRuleText } from "@/features/campaigns/lib/rule-points";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useCampaignDraftSave() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { brandProfileId } = useSelectedBrand();
  const { draft, update, reset } = useCampaignWizard();
  const [saving, setSaving] = useState(false);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const title = draft.title.trim();
    if (title.length < 3) {
      throw new Error("Enter a campaign name (at least 3 characters) to save a draft.");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Your session expired. Please log in again.");
    }

    setSaving(true);
    try {
      const body = buildCampaignBody(draft, "draft", brandProfileId);
      if (draft.campaignId) {
        await brandApi.campaigns.update(token, draft.campaignId, body);
      } else {
        const created = await brandApi.campaigns.create(token, body);
        update({ campaignId: created.id });
      }
      return true;
    } finally {
      setSaving(false);
    }
  }, [brandProfileId, draft, getToken, update]);

  const publish = useCallback(async (): Promise<{ id: string }> => {
    if (hasInvalidReferenceAssets(draft.referenceAssets)) {
      throw new Error(
        "Upload files for all image/video reference assets before publishing.",
      );
    }

    const title = draft.title.trim();
    if (title.length < 3) {
      throw new Error("Campaign name is required.");
    }
    if (!meetsMinimumRuleText(draft.briefHook)) {
      throw new Error("Add at least one hook point (10+ characters total).");
    }

    const token = getToken();
    if (!token) {
      throw new Error("Your session expired. Please log in again.");
    }

    setSaving(true);
    try {
      const body = buildCampaignBody(draft, "live", brandProfileId);
      if (draft.campaignId) {
        const updated = await brandApi.campaigns.update(token, draft.campaignId, body);
        return { id: updated.id };
      }
      const created = await brandApi.campaigns.create(token, body);
      return { id: created.id };
    } finally {
      setSaving(false);
    }
  }, [brandProfileId, draft, getToken]);

  const saveDraftWithFeedback = useCallback(
    async (toast: (message: string, type?: "success" | "error") => void) => {
      try {
        await saveDraft();
        toast("Campaign saved as draft.", "success");
        reset();
        navigate("/campaigns");
      } catch (error) {
        toast(apiErrorMessage(error, "Could not save draft."), "error");
      }
    },
    [navigate, reset, saveDraft],
  );

  const publishWithFeedback = useCallback(
    async (
      toast: (message: string, type?: "success" | "error") => void,
    ): Promise<string | null> => {
      try {
        const result = await publish();
        toast("Campaign published. Creators can now discover it.", "success");
        reset();
        navigate("/campaigns");
        return result.id;
      } catch (error) {
        toast(apiErrorMessage(error, "Could not publish campaign."), "error");
        return null;
      }
    },
    [navigate, publish, reset],
  );

  return { saveDraft, publish, saveDraftWithFeedback, publishWithFeedback, saving };
}
