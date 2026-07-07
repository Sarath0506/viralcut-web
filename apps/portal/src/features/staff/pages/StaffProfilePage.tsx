import { ProfileSection } from "@/features/settings/components/ProfileSection";

export function StaffProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-2xl font-bold">My Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your staff account.</p>
      </header>

      <ProfileSection />
    </div>
  );
}
