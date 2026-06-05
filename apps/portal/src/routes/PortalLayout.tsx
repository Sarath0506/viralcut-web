import { Outlet } from "react-router-dom";

import { DashboardShell } from "@/components/shell/dashboard-shell";

export function PortalLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
