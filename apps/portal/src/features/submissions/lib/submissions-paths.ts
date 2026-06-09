export function submissionsListPath(role: string | null | undefined): string {
  return role === "admin" ? "/admin/submissions" : "/submissions";
}

export function submissionDetailPath(
  role: string | null | undefined,
  deliverableId: string,
): string {
  return `${submissionsListPath(role)}/${deliverableId}`;
}
