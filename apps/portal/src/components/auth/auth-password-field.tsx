"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { AuthFieldIcon } from "@/components/auth/auth-field-icon";
import { authInputClass, authLabelClass } from "@/components/auth/auth-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
  minLength = 8,
  required = true,
  hideLabel = false,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: "new-password" | "current-password";
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {hideLabel ? null : (
        <Label htmlFor={id} className={authLabelClass}>
          {label}
        </Label>
      )}
      <div className="group relative">
        <AuthFieldIcon>
          <Lock className="size-[18px] group-focus-within:text-primary sm:size-5" />
        </AuthFieldIcon>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minLength={minLength}
          className={cn(authInputClass, "pr-10 sm:pr-11")}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground sm:right-3.5"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-[18px] sm:size-5" />
          ) : (
            <Eye className="size-[18px] sm:size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
