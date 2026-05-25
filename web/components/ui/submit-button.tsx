"use client";

import * as React from "react";
import { Loader2, type LucideIcon } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SubmitButtonProps extends ButtonProps {
  icon: LucideIcon;
  label: string;
  pendingLabel?: string;
  isPending?: boolean;
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    {
      icon: Icon,
      label,
      pendingLabel,
      isPending = false,
      className,
      disabled,
      type = "submit",
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        disabled={disabled ?? isPending}
        className={cn("w-full", className)}
        {...props}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {pendingLabel ?? label}
          </>
        ) : (
          <>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </>
        )}
      </Button>
    );
  },
);
SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
