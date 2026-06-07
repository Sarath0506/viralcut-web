import { Navigate, Outlet } from "react-router-dom";

import type { Portal } from "@/lib/portal";
import { useAuth } from "@/providers/auth-provider";

export function RoleRoute({ allowedRoles }: { allowedRoles: Portal[] }) {
  const { auth } = useAuth();
  const role = auth?.user.role === "admin" ? "admin" : "brand";

  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
