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

export function formatEstimatedViews(views: number): string {
  if (views <= 0) return "—";
  return views.toLocaleString("en-IN");
}
