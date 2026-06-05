import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CampaignPaginationProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
};

function pageNumbers(current: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 3) return [1, 2, 3];
  if (current >= totalPages - 2) return [totalPages - 2, totalPages - 1, totalPages];
  return [current - 1, current, current + 1];
}

export function CampaignPagination({
  page,
  limit,
  total,
  onPageChange,
}: CampaignPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing {start} to {end} of {total} campaigns
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            type="button"
            variant={p === page ? "default" : "outline"}
            size="sm"
            className={cn("h-8 min-w-8 px-2", p === page && "bg-primary")}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
