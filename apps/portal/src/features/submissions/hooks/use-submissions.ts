import { useQuery } from "@tanstack/react-query";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function useSubmissions() {
  const { auth, getToken } = useAuth();
  const { brandProfileId } = useSelectedBrand();
  const token = getToken();

  return useQuery({
    queryKey: ["submissions", brandProfileId],
    queryFn: () =>
      brandApi.submissions.list(token!, {
        brandProfileId: brandProfileId ?? undefined,
      }),
    enabled: Boolean(auth && token && brandProfileId),
  });
}

export function useSubmission(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => brandApi.submissions.get(token!, id!),
    enabled: Boolean(auth && token && id),
  });
}
