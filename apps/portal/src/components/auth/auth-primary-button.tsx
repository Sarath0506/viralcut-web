import type { ReactNode } from "react";

import { authPrimaryButtonClass } from "@/components/auth/auth-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthPrimaryButton({
  children,
  loading,
  loadingText,
  trailingIcon,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingText?: string;
  trailingIcon?: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={loading || props.disabled}
      className={cn(authPrimaryButtonClass, className)}
      {...props}
    >
      {loading ? loadingText ?? "Please wait…" : children}
      {!loading && trailingIcon ? trailingIcon : null}
    </Button>
  );
}
