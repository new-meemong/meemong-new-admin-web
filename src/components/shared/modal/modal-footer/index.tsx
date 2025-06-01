import * as React from "react";
import { cn } from "@/lib/utils";

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("sticky bottom-0 left-0 mt-6 flex justify-end gap-2 p-modal", className)} {...props} />
  );
}
