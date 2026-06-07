import { io, type Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    socket.auth = { token };
    return socket;
  }

  socket = io(`${API_BASE}/realtime`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function joinCampaignRoom(campaignId: string): void {
  socket?.emit("campaign:join", { campaignId });
}

export function leaveCampaignRoom(campaignId: string): void {
  socket?.emit("campaign:leave", { campaignId });
}
