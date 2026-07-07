import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { ApiError, staffApi, type Task, type TaskStatus } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: "bg-surface-variant text-muted",
  in_progress: "bg-warning/15 text-warning",
  done: "bg-emerald-500/15 text-emerald-400",
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function TaskRow({ task }: { task: Task }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: TaskStatus) => staffApi.updateTaskStatus(getToken()!, task.id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["staff-tasks"] }),
    onError: (err) => toast(err instanceof ApiError ? err.message : "Failed to update task", "error"),
  });

  const next = NEXT_STATUS[task.status];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{task.title}</p>
        {task.description && <p className="mt-0.5 text-sm text-muted line-clamp-2">{task.description}</p>}
        <p className="mt-1 text-xs text-muted">
          {task.brand ? `${task.brand.companyName} · ` : ""}
          {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[task.status]}`}>
        {STATUS_LABEL[task.status]}
      </span>
      {next && (
        <button
          onClick={() => mutation.mutate(next)}
          disabled={mutation.isPending}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-variant disabled:opacity-50"
        >
          Mark {STATUS_LABEL[next]}
        </button>
      )}
    </div>
  );
}

export function StaffTasksPage() {
  const { getToken } = useAuth();

  const { data: tasks = [], isPending } = useQuery({
    queryKey: ["staff-tasks"],
    queryFn: () => staffApi.listMyTasks(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) return <PortalShellSkeleton />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">My Tasks</h1>
        <p className="mt-1 text-sm text-muted">Tasks assigned to you by the admin team.</p>
      </header>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="font-medium">No tasks yet</p>
          <p className="mt-1 text-sm text-muted">Tasks assigned to you will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
}
