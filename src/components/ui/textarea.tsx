import * as React from "react";

import { cn } from "@/lib/utils";

const sizeClass = {
  md: "w-[262px] h-[44px] px-[12px] py-[12px] rounded-6",
  sm: "w-[262px] h-[30px] px-[8px] py-[5px] rounded-0",
} as const;

type TextareaSize = keyof typeof sizeClass;

export type TextareaProps = Omit<React.ComponentProps<"textarea">, "size"> & {
  size?: TextareaSize;
};

function Textarea({ className, size = "sm", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground typo-body-2-regular min-h-16 w-full rounded-[6px] border bg-background px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        size ? sizeClass[size] : sizeClass.md,

        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
