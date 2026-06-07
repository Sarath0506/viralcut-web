import { Navigate, Outlet, useLocation } from "react-router-dom";

import { dashboardPathForRole } from "@/lib/portal";
import { useAuth } from "@/providers/auth-provider";

function isInviteAcceptPath(pathname: string): boolean {
  return (
    pathname === "/invite/campaign" || pathname.endsWith("/invite/campaign")
  );
}

export function GuestRoute() {
  const { auth, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return null;
  }

  if (auth && !isInviteAcceptPath(pathname)) {
    return (
      <Navigate to={dashboardPathForRole(auth.user.role)} replace />
    );
  }

  return <Outlet />;
}
