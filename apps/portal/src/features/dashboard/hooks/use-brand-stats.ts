import { useQuery } from "@tanstack/react-query";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function useBrandStats() {
  const { auth, getToken } = useAuth();
  const { brandProfileId } = useSelectedBrand();
  const token = getToken();

  return useQuery({
    queryKey: ["brand-stats", brandProfileId],
    queryFn: () => brandApi.stats(token!, brandProfileId ?? undefined),
    enabled: Boolean(auth && token && brandProfileId),
  });
}
