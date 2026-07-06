import { useQuery } from "@tanstack/react-query";

import { portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function useSubmission(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submission", "deliverable", id],
    queryFn: () => portalApi.submissions.get(token!, id!),
    enabled: Boolean(auth && token && id),
  });
}
