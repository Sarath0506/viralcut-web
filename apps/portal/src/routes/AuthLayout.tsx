import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="h-dvh max-h-dvh min-h-0 overflow-hidden">
      <Outlet />
    </div>
  );
}
