import { useQuery } from "@tanstack/react-query";

import { portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function useBrandStats() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["brand-stats"],
    queryFn: () => portalApi.stats(token!),
    enabled: Boolean(auth && token),
  });
}
