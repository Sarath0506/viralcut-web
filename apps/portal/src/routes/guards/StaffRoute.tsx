import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/providers/auth-provider";

export function StaffRoute() {
  const { auth } = useAuth();

  if (!auth || auth.user.role !== "staff") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
