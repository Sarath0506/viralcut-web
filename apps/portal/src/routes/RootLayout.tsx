import { Outlet } from "react-router-dom";

import { AuthProvider } from "@/providers/auth-provider";
import { SelectedBrandProvider } from "@/providers/selected-brand-provider";

export function RootLayout() {
  return (
    <AuthProvider>
      <SelectedBrandProvider>
        <Outlet />
      </SelectedBrandProvider>
    </AuthProvider>
  );
}
