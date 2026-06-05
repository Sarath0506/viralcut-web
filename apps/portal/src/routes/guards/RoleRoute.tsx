import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/providers/auth-provider";
import type { Portal } from "@/lib/portal";

export function RoleRoute({ allowedRoles }: { allowedRoles: Portal[] }) {
  const { auth } = useAuth();
  const role = auth?.user.role;

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const portal: Portal = role === "agency" ? "agency" : "brand";
  if (!allowedRoles.includes(portal)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
