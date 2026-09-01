/** NOT currently called anywhere. CampaignPayoutPage already charges the
 * platform fee on top of the entered budget at checkout
 * (totalCheckout = budget + fee), meaning the budget itself is already
 * fully clipper-payable — applying this on top of that would double-count
 * the fee. Mirrors the backend's computePayableBudgetPaise
 * (viralcut-api's src/common/earnings.ts), which is likewise unused for
 * now. Kept here in case the pricing model is intentionally revisited —
 * see the "budget × 0.85" vs. "budget + 15% at checkout" discrepancy
 * flagged when this was built. */
export function computePayableBudget(
  budgetRupees: number,
  platformFeeBps = 1500,
): number {
  if (!Number.isFinite(budgetRupees) || budgetRupees <= 0) return 0;
  return budgetRupees * ((10000 - platformFeeBps) / 10000);
}

export function estimateViewsFromBudget(
  budgetRupees: number,
  ratePer1kRupees: number,
): number {
  if (
    !Number.isFinite(budgetRupees) ||
    !Number.isFinite(ratePer1kRupees) ||
    ratePer1kRupees <= 0 ||
    budgetRupees <= 0
  ) {
    return 0;
  }
  return Math.floor((budgetRupees / ratePer1kRupees) * 1000);
}

/** Rounds up — a budget that could theoretically stretch across 4.2 clippers
 * at their individual payout cap still needs 5 real people to spend it. */
export function estimateMinClippersNeeded(
  budgetRupees: number,
  maxPayoutRupees: number,
): number {
  if (
    !Number.isFinite(budgetRupees) ||
    budgetRupees <= 0 ||
    !Number.isFinite(maxPayoutRupees) ||
    maxPayoutRupees <= 0
  ) {
    return 0;
  }
  return Math.ceil(budgetRupees / maxPayoutRupees);
}

export function formatEstimatedViews(views: number): string {
  if (views <= 0) return "—";
  return views.toLocaleString("en-IN");
}
