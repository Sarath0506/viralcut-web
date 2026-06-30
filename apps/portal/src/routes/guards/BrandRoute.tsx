import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/providers/auth-provider";

export function BrandRoute() {
  const { auth, isLoading } = useAuth();

  if (isLoading) return null;

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (auth.user.role === "staff") {
    return <Navigate to="/staff/brands" replace />;
  }

  return <Outlet />;
}
