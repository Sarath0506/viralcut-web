import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Target, Trash2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createRulePoint,
  parseRulePoints,
  serializeRulePoints,
  type RulePoint,
} from "@/features/campaigns/lib/rule-points";
import { cn } from "@/lib/utils";

type RulePointsEditorProps = {
  value: string;
  onChange: (value: string) => void;
  variant: "do" | "avoid" | "hook" | "focus";
  title: string;
  description: string;
  addLabel: string;
  placeholder: string;
  emptyHint: string;
};

const variantStyles = {
  do: {
    icon: CheckCircle2,
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
    headerBg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    inputFocus: "focus:border-emerald-500/50 focus:ring-emerald-500/20",
    addButton: "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10",
  },
  avoid: {
    icon: AlertTriangle,
    accent: "text-rose-400",
    border: "border-rose-500/30",
    headerBg: "bg-rose-500/10",
    dot: "bg-rose-400",
    inputFocus: "focus:border-rose-500/50 focus:ring-rose-500/20",
    addButton: "border-rose-500/30 text-rose-300 hover:bg-rose-500/10",
  },
  hook: {
    icon: Zap,
    accent: "text-primary",
    border: "border-primary/30",
    headerBg: "bg-primary/10",
    dot: "bg-primary",
    inputFocus: "focus:border-primary/50 focus:ring-primary/20",
    addButton: "border-primary/30 text-primary hover:bg-primary/10",
  },
  focus: {
    icon: Target,
    accent: "text-violet-400",
    border: "border-violet-500/30",
    headerBg: "bg-violet-500/10",
    dot: "bg-violet-400",
    inputFocus: "focus:border-violet-500/50 focus:ring-violet-500/20",
    addButton: "border-violet-500/30 text-violet-300 hover:bg-violet-500/10",
  },
} as const;

export function RulePointsEditor({
  value,
  onChange,
  variant,
  title,
  description,
  addLabel,
  placeholder,
  emptyHint,
}: RulePointsEditorProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;
  const [points, setPoints] = useState<RulePoint[]>(() => parseRulePoints(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setPoints(parseRulePoints(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const commitPoints = (next: RulePoint[]) => {
    setPoints(next);
    const serialized = serializeRulePoints(next);
    lastEmitted.current = serialized;
    onChange(serialized);
  };

  const updatePoint = (id: string, text: string) => {
    commitPoints(points.map((point) => (point.id === id ? { ...point, text } : point)));
  };

  const removePoint = (id: string) => {
    commitPoints(points.filter((point) => point.id !== id));
  };

  const addPoint = () => {
    commitPoints([...points, createRulePoint()]);
  };

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-surface/80",
        styles.border,
      )}
    >
      <div className={cn("flex items-start gap-3 border-b px-4 py-3", styles.border, styles.headerBg)}>
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            styles.border,
            styles.headerBg,
          )}
        >
          <Icon className={cn("h-4 w-4", styles.accent)} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {points.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 bg-background/40 px-3 py-4 text-center text-sm text-muted">
            {emptyHint}
          </p>
        ) : (
          <ol className="space-y-2">
            {points.map((point, index) => (
              <li key={point.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-background",
                    styles.dot,
                  )}
                >
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={point.text}
                  placeholder={placeholder}
                  onChange={(e) => updatePoint(point.id, e.target.value)}
                  className={cn(
                    "min-h-10 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70",
                    "outline-none ring-0 transition focus:ring-2",
                    styles.inputFocus,
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-0.5 shrink-0 text-muted hover:text-destructive"
                  onClick={() => removePoint(point.id)}
                  aria-label={`Remove point ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ol>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPoint}
          className={cn("w-full border-dashed bg-transparent", styles.addButton)}
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </section>
  );
}
