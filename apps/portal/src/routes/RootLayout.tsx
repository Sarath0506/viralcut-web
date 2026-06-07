import { Outlet } from "react-router-dom";

import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";

export function RootLayout() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <Outlet />
      </RealtimeProvider>
    </AuthProvider>
  );
}
