import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, ChevronUp, CircleHelp, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { adminApi, type Faq } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AdminFaqsPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const { data: faqs, isPending } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => adminApi.faqs(getToken()!),
    enabled: Boolean(getToken()),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });

  const toggleVisible = useMutation({
    mutationFn: (faq: Faq) => adminApi.updateFaq(getToken()!, faq.id, { isVisible: !faq.isVisible }),
    onSuccess: invalidate,
    onError: () => toast("Failed to update FAQ", "error"),
  });

  const move = useMutation({
    mutationFn: (orderedIds: string[]) => adminApi.reorderFaqs(getToken()!, orderedIds),
    onSuccess: invalidate,
    onError: () => toast("Failed to reorder FAQs", "error"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(getToken()!, id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast("FAQ deleted");
    },
    onError: () => toast("Failed to delete FAQ", "error"),
  });

  const list = faqs ?? [];
  const activeCount = list.filter((f) => f.isVisible).length;
  const hiddenCount = list.length - activeCount;

  const moveFaq = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    move.mutate(reordered.map((f) => f.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">FAQ Management</h1>
        <p className="mt-1 text-sm text-muted">
          Manage frequently asked questions shown on the creator app's Support Center.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Total FAQs</p>
          <p className="mt-2 text-3xl font-black text-foreground">{list.length}</p>
        </div>
        <div className="rounded-2xl border border-money/20 bg-money/5 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-money">Active</p>
          <p className="mt-2 text-3xl font-black text-foreground">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Hidden</p>
          <p className="mt-2 text-3xl font-black text-foreground">{hiddenCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-foreground">All FAQs</p>
            <p className="text-xs text-muted">Use the arrows to reorder. Changes are saved immediately.</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add FAQ
          </Button>
        </div>

        {isPending ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <CircleHelp className="h-8 w-8 text-muted/30" />
            <p className="text-sm text-muted">No FAQs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {list.map((faq, i) => (
              <div key={faq.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <button
                    disabled={i === 0 || move.isPending}
                    onClick={() => moveFaq(i, -1)}
                    className="rounded text-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-muted">{i + 1}</span>
                  <button
                    disabled={i === list.length - 1 || move.isPending}
                    onClick={() => moveFaq(i, 1)}
                    className="rounded text-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{faq.question}</p>
                  <p className="mt-1 text-sm text-muted">{faq.answer}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleVisible.mutate(faq)}
                    disabled={toggleVisible.isPending}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      faq.isVisible ? "bg-money/15 text-money" : "bg-surface-variant text-muted"
                    }`}
                  >
                    {faq.isVisible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {faq.isVisible ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(faq);
                      setFormOpen(true);
                    }}
                    className="rounded p-1.5 text-muted hover:bg-surface-variant/60 hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(faq)}
                    className="rounded p-1.5 text-muted hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <FaqFormModal
          faq={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            invalidate();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this FAQ?"
        description={deleteTarget ? `"${deleteTarget.question}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        variant="destructive"
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function FaqFormModal({
  faq,
  onClose,
  onSaved,
}: {
  faq: Faq | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [isVisible, setIsVisible] = useState(faq?.isVisible ?? true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const save = useMutation({
    mutationFn: () =>
      faq
        ? adminApi.updateFaq(getToken()!, faq.id, { question: question.trim(), answer: answer.trim(), isVisible })
        : adminApi.createFaq(getToken()!, { question: question.trim(), answer: answer.trim(), isVisible }),
    onSuccess: onSaved,
    onError: () => toast(faq ? "Failed to update FAQ" : "Failed to create FAQ", "error"),
  });

  const valid = question.trim().length >= 3 && answer.trim().length >= 3;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <CircleHelp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{faq ? "Edit FAQ" : "Add New FAQ"}</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          {faq ? "Update this question and answer." : "Create a new frequently asked question."}
        </p>

        <div className="mt-5">
          <label className="text-sm font-semibold text-foreground">Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
            rows={2}
            placeholder="e.g. How do I get paid for my views?"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface-variant/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-right text-xs text-muted">{question.length}/500</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, 5000))}
            rows={5}
            placeholder="Provide a clear, helpful answer…"
            className="mt-1.5 w-full rounded-xl border border-border bg-surface-variant/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-right text-xs text-muted">{answer.length}/5000</p>
        </div>

        <label className="mt-2 flex items-center justify-between rounded-xl border border-border bg-surface-variant/30 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Visible to users</p>
            <p className="text-xs text-muted">When enabled, this FAQ appears in the app's Support Center.</p>
          </div>
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="h-5 w-9 shrink-0"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={() => save.mutate()} disabled={!valid || save.isPending}>
            {save.isPending ? "Saving…" : faq ? "Save Changes" : "Create FAQ"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
