import { useQuery } from "@tanstack/react-query";

import { ProfileSection } from "@/features/settings/components/ProfileSection";
import { portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AdminProfilePage() {
  const { getToken, auth } = useAuth();

  const { data: me } = useQuery({
    queryKey: ["me", "admin"],
    queryFn: () => portalApi.me(getToken()!),
    enabled: Boolean(getToken()),
  });

  const name = me?.displayName ?? auth?.user.displayName ?? "Admin";
  const email = me?.email ?? auth?.user.email ?? "—";

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/15 text-xl font-black text-primary">
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-bold text-foreground">{name}</h1>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Administrator
            </span>
          </div>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <ProfileSection showBioAndSocials={false} />
      </div>
    </div>
  );
}
