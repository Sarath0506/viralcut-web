import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/providers/auth-provider";

/** Allow authenticated brand users to complete workspace invites. */
function isInviteAcceptPath(pathname: string): boolean {
  return pathname === "/invite/accept" || pathname.endsWith("/invite/accept");
}

export function GuestRoute() {
  const { auth, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return null;
  }

  if (auth && !isInviteAcceptPath(pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
