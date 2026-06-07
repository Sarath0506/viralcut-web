import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getWizardExitPath,
  getWizardPreviousPath,
} from "@/features/campaigns/lib/wizard-paths";
import { usePortalRole } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export function useWizardBack() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const { paths, draft } = useCampaignWizard();

  const goBack = useCallback(() => {
    const previous = getWizardPreviousPath(pathname, paths);
    if (previous) {
      navigate(previous);
      return;
    }
    navigate(getWizardExitPath(draft.campaignId, isAdmin));
  }, [draft.campaignId, isAdmin, navigate, pathname, paths]);

  const backLabel =
    pathname === paths.basics && !draft.campaignId ? "Cancel" : "Back";

  return { goBack, backLabel };
}
