import * as React from "react";
import { cn } from "@/lib/utils";
import { useModalContext } from "@/components/shared/modal/context";

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function ModalBody({ className, ...props }: ModalBodyProps) {
  const { size } = useModalContext();

  return (
    <div
      className={cn(
        "space-y-4 p-modal overflow-y-auto",
        "flex-1",
        { "pt-0 pb-[25px] px-[33px]": size === "xs" },
        className,
      )}
      {...props}
    />
  );
}
