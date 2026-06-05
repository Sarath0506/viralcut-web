import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { AuthFieldIcon } from "@/components/auth/auth-field-icon";
import { authInputClass, authLabelClass } from "@/components/auth/auth-styles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AuthTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  icon: LucideIcon;
  wrapperClassName?: string;
}

export function AuthTextField({
  label,
  icon: Icon,
  id,
  wrapperClassName,
  ...props
}: AuthTextFieldProps) {
  return (
    <div className={wrapperClassName}>
      <Label htmlFor={id} className={authLabelClass}>
        {label}
      </Label>
      <div className="group relative">
        <AuthFieldIcon>
          <Icon className="size-[18px] group-focus-within:text-primary sm:size-5" />
        </AuthFieldIcon>
        <Input id={id} className={authInputClass} {...props} />
      </div>
    </div>
  );
}
