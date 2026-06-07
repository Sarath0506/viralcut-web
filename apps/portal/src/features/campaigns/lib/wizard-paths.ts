export type WizardPaths = {
  basics: string;
  brief: string;
  payout: string;
  review: string;
};

/** Opens the wizard at Details so every step can be edited in order. */
export function getWizardEditPath(campaignId: string, admin = false): string {
  return getWizardPaths(campaignId, admin).basics;
}

export function getWizardPreviousPath(
  pathname: string,
  paths: WizardPaths,
): string | null {
  if (pathname === paths.review) return paths.payout;
  if (pathname === paths.payout) return paths.brief;
  if (pathname === paths.brief) return paths.basics;
  return null;
}

export function getWizardExitPath(
  campaignId: string | null,
  admin = false,
): string {
  const prefix = admin ? "/admin/campaigns" : "/campaigns";
  return campaignId ? `${prefix}/${campaignId}` : prefix;
}

export function getWizardPaths(
  campaignId: string | null,
  admin = false,
): WizardPaths {
  const prefix = admin ? "/admin/campaigns" : "/campaigns";

  if (campaignId) {
    const base = `${prefix}/${campaignId}/edit`;
    return {
      basics: base,
      brief: `${base}/brief`,
      payout: `${base}/payout`,
      review: `${base}/review`,
    };
  }
  return {
    basics: `${prefix}/new`,
    brief: `${prefix}/new/brief`,
    payout: `${prefix}/new/payout`,
    review: `${prefix}/new/review`,
  };
}
