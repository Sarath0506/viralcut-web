import { Skeleton } from "@/components/ui/skeleton";

export function PortalShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="px-4 pt-6 pb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
        <div className="space-y-1 px-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto p-3">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Skeleton className="h-[4.25rem] w-full rounded-none" />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-[1200px] space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

export function CampaignListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="ml-auto h-10 w-40 rounded-xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Skeleton className="h-12 w-full rounded-none" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-none" />
      ))}
    </div>
  );
}
