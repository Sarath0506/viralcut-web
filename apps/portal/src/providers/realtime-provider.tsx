import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";

import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/providers/auth-provider";

const RealtimeContext = createContext<object>({});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { auth, getToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!auth || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    const invalidateCampaigns = () => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    };

    socket.on("campaign:created", invalidateCampaigns);
    socket.on("campaign:updated", invalidateCampaigns);
    socket.on("campaign:published", invalidateCampaigns);
    socket.on("campaignInvite:sent", invalidateCampaigns);
    socket.on("campaignInvite:accepted", () => {
      invalidateCampaigns();
      void queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    });

    return () => {
      socket.off("campaign:created", invalidateCampaigns);
      socket.off("campaign:updated", invalidateCampaigns);
      socket.off("campaign:published", invalidateCampaigns);
      socket.off("campaignInvite:sent", invalidateCampaigns);
      socket.off("campaignInvite:accepted");
      disconnectSocket();
    };
  }, [auth, getToken, queryClient]);

  return (
    <RealtimeContext.Provider value={{}}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
