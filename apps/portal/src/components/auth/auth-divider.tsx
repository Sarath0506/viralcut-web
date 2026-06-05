export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-4 flex items-center gap-3 sm:my-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-bold tracking-wider text-muted uppercase sm:text-xs">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
