import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquareText, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toaster";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const KYC_LABEL: Record<string, string> = {
  verified: "KYC Verified",
  pending: "KYC Pending",
  rejected: "KYC Rejected",
  not_started: "No KYC",
};

export function AdminSupportTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resolutionNote, setResolutionNote] = useState("");

  const { data: ticket, isPending } = useQuery({
    queryKey: ["admin-support-ticket", id],
    queryFn: () => adminApi.supportTicket(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  const respond = useMutation({
    mutationFn: (action: "investigating" | "resolved") =>
      adminApi.respondToSupportTicket(getToken()!, id!, action, resolutionNote.trim()),
    onSuccess: (_, action) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      setResolutionNote("");
      toast(action === "resolved" ? "Ticket resolved" : "Update saved");
    },
    onError: () => toast("Failed to update ticket", "error"),
  });

  if (isPending) return <DetailPageSkeleton />;
  if (!ticket) return null;

  const name = ticket.creator.displayName ?? ticket.creator.username ?? "Creator";
  const isPendingTicket = ticket.status === "under_investigation";

  return (
    <div className="space-y-6">
      <BackButton to="/admin/support-tickets" label="All Tickets" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — ticket content */}
        <div className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Subject</p>
                <h1 className="mt-1 text-lg font-bold text-foreground">{ticket.subject}</h1>
              </div>
              <StatusPill status={ticket.status} className="shrink-0" />
            </div>
            <div className="px-5 py-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <MessageSquareText className="h-3.5 w-3.5" />
                Message
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{ticket.message}</p>
              <p className="mt-4 text-xs text-muted">Submitted {formatDate(ticket.createdAt)}</p>
            </div>
          </div>

          {ticket.resolutionNote && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-3.5">
                <p className="text-sm font-semibold text-foreground">
                  {ticket.status === "resolved" ? "Resolution" : "Latest update"}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{ticket.resolutionNote}</p>
                {ticket.resolvedAt && (
                  <p className="mt-3 text-xs text-muted">Resolved {formatDate(ticket.resolvedAt)}</p>
                )}
              </div>
            </div>
          )}

          {isPendingTicket && (
            <div className="rounded-2xl border border-border bg-surface-variant/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Respond to this ticket</p>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                placeholder="What do you want to tell the clipper? (required)"
                className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={respond.isPending || resolutionNote.trim().length < 3}
                  onClick={() => respond.mutate("investigating")}
                >
                  {respond.isPending && respond.variables === "investigating" ? "Saving…" : "Still Investigating"}
                </Button>
                <Button
                  className="flex-1"
                  disabled={respond.isPending || resolutionNote.trim().length < 3}
                  onClick={() => respond.mutate("resolved")}
                >
                  {respond.isPending && respond.variables === "resolved" ? "Resolving…" : "Mark Resolved"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — clipper summary */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Clipper</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {ticket.creator.avatarUrl ? (
                    <img src={ticket.creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                  {ticket.creator.username && (
                    <p className="truncate text-xs text-muted">@{ticket.creator.username}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ticket.creator.email ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ticket.creator.phone ?? "—"}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-bold text-muted">
                  {KYC_LABEL[ticket.creator.kycStatus] ?? ticket.creator.kycStatus}
                </span>
                <span className="text-[11px] text-muted">Joined {formatDate(ticket.creator.createdAt)}</span>
              </div>

              <Link
                to={`/admin/clippers/${ticket.creator.id}`}
                className="mt-4 block rounded-xl border border-border px-3 py-2 text-center text-xs font-semibold text-foreground transition-colors hover:bg-surface-variant/40"
              >
                View full profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
