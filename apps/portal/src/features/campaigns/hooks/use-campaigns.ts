import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { brandApi, type CampaignStatusFilter } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

const PAGE_SIZE = 6;

export function useCampaignsList(
  status: CampaignStatusFilter,
  page: number,
) {
  const { auth, getToken } = useAuth();
  const { brandProfileId } = useSelectedBrand();
  const token = getToken();
  const apiStatus = status === "all" ? undefined : status;

  return useQuery({
    queryKey: ["campaigns", status, page, brandProfileId],
    queryFn: () =>
      brandApi.campaigns.list(token!, {
        status: apiStatus,
        page,
        limit: PAGE_SIZE,
        brandProfileId: brandProfileId ?? undefined,
      }),
    enabled: Boolean(auth && token && brandProfileId),
  });
}

export function useCampaign(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => brandApi.campaigns.get(token!, id!),
    enabled: Boolean(auth && token && id),
  });
}

export function useUpdateCampaignStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "live" | "paused" | "closed";
    }) => {
      const token = getToken();
      if (!token) throw new Error("Your session expired. Please log in again.");
      return brandApi.campaigns.update(token, id, { status });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
    },
  });
}

export function useDeleteCampaign() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Your session expired. Please log in again.");
      return brandApi.campaigns.delete(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export { PAGE_SIZE };
