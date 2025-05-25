import * as React from "react";

import { cn } from "@/lib/utils";

const sizeClass = {
  md: "w-[262px] h-[44px] px-[15px] py-[12px] rounded-6",
  sm: "w-[262px] h-[36px] px-[15px] py-[5px] rounded-0",
} as const;

type InputSize = keyof typeof sizeClass;

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: InputSize;
};

function Input({ className, type, size = "md", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border flex w-full min-w-0 border bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "typo-body-2-regular text-foreground-strong",
        "focus-visible:border-primary-foreground",
        "aria-invalid:border-destructive",
        size ? sizeClass[size] : sizeClass.md,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
