"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

import { cn } from "@/lib/utils";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void;
} | null>(null);

const TOAST_DURATION_MS = 4500;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const isError = toast.type === "error";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto grid w-full max-w-sm grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg ring-1 ring-black/5",
        "[animation:toast-enter_0.3s_ease-out]",
        isError ? "border-destructive/30" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isError ? "bg-destructive/10 text-destructive" : "bg-money/10 text-money",
        )}
        aria-hidden
      >
        {isError ? (
          <AlertCircle className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
      </span>
      <p className="min-w-0 text-center text-sm font-medium leading-snug text-foreground">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-surface-variant hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(100vw-2rem,24rem)] flex-col gap-3 sm:top-6 sm:right-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
