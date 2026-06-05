export type WizardPaths = {
  basics: string;
  brief: string;
  payout: string;
  review: string;
};

export function getWizardPaths(campaignId: string | null): WizardPaths {
  if (campaignId) {
    const base = `/campaigns/${campaignId}/edit`;
    return {
      basics: base,
      brief: `${base}/brief`,
      payout: `${base}/payout`,
      review: `${base}/review`,
    };
  }
  return {
    basics: "/campaigns/new",
    brief: "/campaigns/new/brief",
    payout: "/campaigns/new/payout",
    review: "/campaigns/new/review",
  };
}
