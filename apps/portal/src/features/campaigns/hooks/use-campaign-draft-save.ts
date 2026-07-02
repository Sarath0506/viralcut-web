import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  buildCampaignBody,
  hasInvalidReferenceAssets,
} from "@/features/campaigns/lib/campaign-payload";
import { ApiError, portalApi } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useCampaignDraftSave() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const { draft, reset, saveNow } = useCampaignWizard();
  const [saving, setSaving] = useState(false);

  const campaignsBase = isAdmin ? "/admin/campaigns" : "/campaigns";

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const title = draft.title.trim();
    if (!title) {
      throw new Error("Enter a campaign name to save a draft.");
    }

    setSaving(true);
    try {
      await saveNow("review");
      return true;
    } finally {
      setSaving(false);
    }
  }, [draft.title, saveNow]);

  const publish = useCallback(async (): Promise<{ id: string }> => {
    if (hasInvalidReferenceAssets(draft.referenceAssets)) {
      throw new Error(
        "Upload files for all image/video reference assets before publishing.",
      );
    }

    const token = getToken();
    if (!token) {
      throw new Error("Your session expired. Please log in again.");
    }

    setSaving(true);
    try {
      const body = buildCampaignBody(draft, "live");
      if (draft.campaignId) {
        const updated = await portalApi.campaigns.update(
          token,
          draft.campaignId,
          { ...body, wizardStep: "review" },
        );
        return { id: updated.id };
      }
      const created = await portalApi.campaigns.create(token, {
        ...body,
        wizardStep: "review",
      });
      return { id: created.id };
    } finally {
      setSaving(false);
    }
  }, [draft, getToken, isAdmin]);

  const saveDraftWithFeedback = useCallback(
    async (toast: (message: string, type?: "success" | "error") => void) => {
      try {
        await saveDraft();
        const campaignId = draft.campaignId;
        toast(
          draft.status === "draft" ? "Campaign saved as draft." : "Changes saved.",
          "success",
        );
        reset();
        navigate(
          campaignId ? `${campaignsBase}/${campaignId}` : campaignsBase,
        );
      } catch (error) {
        toast(apiErrorMessage(error, "Could not save draft."), "error");
      }
    },
    [campaignsBase, draft.campaignId, draft.status, navigate, reset, saveDraft],
  );

  const publishWithFeedback = useCallback(
    async (
      toast: (message: string, type?: "success" | "error") => void,
    ): Promise<string | null> => {
      try {
        const result = await publish();
        toast("Campaign published. Creators can now discover it.", "success");
        reset();
        navigate(campaignsBase);
        return result.id;
      } catch (error) {
        toast(apiErrorMessage(error, "Could not publish campaign."), "error");
        return null;
      }
    },
    [campaignsBase, navigate, publish, reset],
  );

  return {
    saveDraft,
    publish,
    saveDraftWithFeedback,
    publishWithFeedback,
    saving,
  };
}
