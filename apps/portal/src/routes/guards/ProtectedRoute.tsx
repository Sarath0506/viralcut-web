import { Navigate, Outlet } from "react-router-dom";

import { BrandWorkspaceBootstrap } from "@/components/shell/brand-workspace-bootstrap";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

export function ProtectedRoute() {
  const { auth, isLoading } = useAuth();
  const role = usePortalRole();

  if (isLoading) {
    return <PortalShellSkeleton />;
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {role === "brand" ? <BrandWorkspaceBootstrap /> : null}
      <Outlet />
    </>
  );
}
