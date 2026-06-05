import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import { AccountMenu } from "@/components/shell/account-menu";
import { PortalSearch } from "@/components/shell/portal-search";
import { Button } from "@/components/ui/button";
import { usePortalRole } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const role = usePortalRole();
  const { brandProfileId, companyName } = useSelectedBrand();
  const isAgency = role === "agency";

  return (
    <header className="sticky top-0 z-30 flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:gap-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
        <div className="md:max-w-xl lg:max-w-2xl flex-1">
          <PortalSearch />
        </div>
        {isAgency ? (
          brandProfileId ? (
            <span className="truncate text-sm text-muted">
              Brand:{" "}
              <span className="font-medium text-foreground">{companyName}</span>
            </span>
          ) : (
            <Link to="/brands" className="text-sm text-primary hover:underline">
              Select a brand
            </Link>
          )
        ) : companyName ? (
          <span className="truncate text-sm text-muted">
            <span className="font-medium text-foreground">{companyName}</span>
          </span>
        ) : null}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}
