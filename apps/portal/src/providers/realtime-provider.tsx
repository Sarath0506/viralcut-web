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

    const invalidateSubmissions = () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      void queryClient.invalidateQueries({ queryKey: ["submission"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    };

    socket.on("deliverable:submitted", invalidateSubmissions);
    socket.on("deliverable:reviewed", invalidateSubmissions);
    socket.on("deliverable:live_proof", invalidateSubmissions);
    socket.on("participation:joined", invalidateSubmissions);

    const invalidateNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    };
    socket.on("notification:new", invalidateNotifications);

    return () => {
      socket.off("campaign:created", invalidateCampaigns);
      socket.off("campaign:updated", invalidateCampaigns);
      socket.off("campaign:published", invalidateCampaigns);
      socket.off("campaignInvite:sent", invalidateCampaigns);
      socket.off("campaignInvite:accepted");
      socket.off("deliverable:submitted", invalidateSubmissions);
      socket.off("deliverable:reviewed", invalidateSubmissions);
      socket.off("deliverable:live_proof", invalidateSubmissions);
      socket.off("participation:joined", invalidateSubmissions);
      socket.off("notification:new", invalidateNotifications);
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
