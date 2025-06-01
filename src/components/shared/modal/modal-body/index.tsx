import * as React from "react";
import { cn } from "@/lib/utils";

export function ModalBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "space-y-4 p-modal overflow-y-auto",
        "flex-1",
        className,
      )}
      {...props}
    />
  );
}
