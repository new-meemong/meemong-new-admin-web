import * as React from "react";
import { cn } from "@/lib/utils";

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function FormGroup({
  title,
  className,
  children,
  ...props
}: FormGroupProps) {
  return (
    <div className={cn("h-full form-group flex flex-row items-center", className)} {...props}>
      {(title) && (
        <div className="flex flex-row self-start min-w-[80px] w-[15%] h-full form-group-title mt-[10px] typo-title-2-semibold text-foreground">
          <span>{title}</span>
        </div>
      )}
      <div className="form-group-content flex-1">{children}</div>
    </div>
  );
}
