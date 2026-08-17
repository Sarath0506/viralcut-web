import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { adminApi, type AdminCreatorSummary } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const PAGE_SIZE = 8;

export function AdminNotificationsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [usePush, setUsePush] = useState(true);
  const [useWhatsapp, setUseWhatsapp] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  const { data: creators, isPending: creatorsPending } = useQuery({
    queryKey: ["admin-creators"],
    queryFn: () => adminApi.creators(getToken()!),
    enabled: Boolean(getToken()),
  });

  const { data: channelStatus } = useQuery({
    queryKey: ["admin-bulk-notification-channel-status"],
    queryFn: () => adminApi.bulkNotificationChannelStatus(getToken()!),
    enabled: Boolean(getToken()),
  });

  const { data: history, isPending: historyPending } = useQuery({
    queryKey: ["admin-bulk-notification-history", historyPage],
    queryFn: () => adminApi.bulkNotificationHistory(getToken()!, historyPage),
    enabled: Boolean(getToken()),
  });

  const send = useMutation({
    mutationFn: () =>
      adminApi.sendBulkNotification(getToken()!, {
        recipientIds: Array.from(selected),
        usePush,
        useWhatsapp,
        title: title.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      setSelected(new Set());
      setTitle("");
      setMessage("");
      void queryClient.invalidateQueries({ queryKey: ["admin-bulk-notification-history"] });
      toast("Notification sent");
    },
    onError: () => toast("Failed to send notification", "error"),
  });

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    const list = creators ?? [];
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.displayName ?? "").toLowerCase().includes(q) ||
        (c.username ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [creators, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((c) => c.id)));
  const clearAll = () => setSelected(new Set());

  const noChannelSelected = !usePush && !useWhatsapp;
  const canSend =
    selected.size > 0 &&
    !noChannelSelected &&
    title.trim().length >= 3 &&
    message.trim().length >= 3 &&
    !send.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted">
          Send push or WhatsApp notifications to clippers, in bulk.
        </p>
      </div>

      {/* Compose */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <Bell className="h-4 w-4 text-muted" />
          <p className="text-sm font-semibold text-foreground">Compose</p>
        </div>

        <div className="space-y-5 px-5 py-4">
          {/* Recipients */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Recipients</p>
            <label className="relative mt-2 flex h-10 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email…"
                className="h-full w-full rounded-xl border border-border bg-surface-variant/40 py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </label>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted">{selected.size} recipient{selected.size !== 1 ? "s" : ""} selected</p>
              <div className="flex gap-2">
                {selected.size > 0 && (
                  <button onClick={clearAll} className="text-xs font-semibold text-muted hover:text-foreground">
                    Clear
                  </button>
                )}
                <button onClick={selectAll} className="text-xs font-semibold text-primary hover:underline">
                  Select all {filtered.length} creators
                </button>
              </div>
            </div>

            {creatorsPending ? (
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-variant/40">
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                      <th className="w-10 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every((c) => selected.has(c.id))}
                          onChange={(e) =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              pageItems.forEach((c) => (e.target.checked ? next.add(c.id) : next.delete(c.id)));
                              return next;
                            })
                          }
                        />
                      </th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-muted">
                          No creators match "{search}"
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((c: AdminCreatorSummary) => (
                        <tr key={c.id} className="hover:bg-surface-variant/30">
                          <td className="px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={selected.has(c.id)}
                              onChange={() => toggleOne(c.id)}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-foreground">{c.displayName ?? c.username ?? "Creator"}</p>
                            <p className="text-xs text-muted">{c.email ?? "—"}</p>
                          </td>
                          <td className="px-3 py-2.5 text-muted">{c.phone ?? "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>
                  Page {page} of {totalPages} ({filtered.length} total)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Channel */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Channel</p>
            <div className="mt-2 flex flex-col gap-2">
              <label
                className={`flex items-center gap-2 text-sm ${channelStatus && !channelStatus.pushConfigured ? "text-muted/60" : "text-foreground"}`}
              >
                <input
                  type="checkbox"
                  checked={usePush}
                  disabled={channelStatus ? !channelStatus.pushConfigured : false}
                  onChange={(e) => setUsePush(e.target.checked)}
                />
                Push notification
                {channelStatus && !channelStatus.pushConfigured && (
                  <span className="text-xs text-muted/60">(not configured yet)</span>
                )}
              </label>
              <label
                className={`flex items-center gap-2 text-sm ${channelStatus && !channelStatus.whatsappConfigured ? "text-muted/60" : "text-foreground"}`}
              >
                <input
                  type="checkbox"
                  checked={useWhatsapp}
                  disabled={channelStatus ? !channelStatus.whatsappConfigured : false}
                  onChange={(e) => setUseWhatsapp(e.target.checked)}
                />
                WhatsApp
                {channelStatus && !channelStatus.whatsappConfigured && (
                  <span className="text-xs text-muted/60">(not configured yet)</span>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New campaign opportunity"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Message */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Message</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              rows={4}
              placeholder="Write the notification message…"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-right text-xs text-muted">{message.length}/1000</p>
          </div>

          <div className="flex justify-end">
            <Button disabled={!canSend} onClick={() => send.mutate()}>
              {send.isPending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">History</p>
        </div>
        {historyPending ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : !history || history.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <Bell className="h-8 w-8 text-muted/30" />
            <p className="text-sm text-muted">No notifications sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3">Recipients</th>
                  <th className="px-5 py-3">Push</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Sent by</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.items.map((h) => (
                  <tr key={h.id}>
                    <td className="max-w-[220px] px-5 py-3">
                      <p className="truncate font-semibold text-foreground">{h.title}</p>
                      <p className="truncate text-xs text-muted">{h.message}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-bold text-muted">
                        {h.usedPush && h.usedWhatsapp ? "Push + WhatsApp" : h.usedPush ? "Push" : "WhatsApp"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-foreground">{h.recipientCount}</td>
                    <td className="px-5 py-3 text-muted">
                      {h.usedPush ? `${h.pushSentCount} sent / ${h.pushFailedCount} failed` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {h.usedWhatsapp ? `${h.whatsappSentCount} sent / ${h.whatsappFailedCount} failed` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">{h.sentBy}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(h.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {history && history.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted">
            <span>
              Page {history.page} of {history.totalPages} ({history.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage((p) => p - 1)}
                className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={historyPage >= history.totalPages}
                onClick={() => setHistoryPage((p) => p + 1)}
                className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
