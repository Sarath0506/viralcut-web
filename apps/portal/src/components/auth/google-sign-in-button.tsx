"use client";

import * as React from "react";

import { GoogleIcon } from "@/components/auth/google-icon";
import { authPrimaryButtonClass } from "@/components/auth/auth-styles";
import { cn } from "@/lib/utils";

export interface GoogleSignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function GoogleSignInButton({
  className,
  label = "Continue with Google",
  type = "button",
  ...props
}: GoogleSignInButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "flex items-center justify-center gap-3 border border-border bg-surface text-foreground",
        authPrimaryButtonClass,
        "hover:bg-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        "active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}
