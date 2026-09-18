"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CommonFormReadonlyRowProps<T> {
  label: string;
  value?: T;
  formatter?: (value: T) => React.ReactNode;
  className?: string;
  stacked?: boolean;
}

// react-hook-form 안씀
export function CommonFormReadonlyRow<T>({
  label,
  value,
  formatter,
  className,
  stacked = false,
}: CommonFormReadonlyRowProps<T>) {
  return (
    <div
      className={cn(
        "flex border-b py-[10px]",
        stacked ? "flex-col gap-1" : "flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "shrink-0 font-medium",
          stacked ? "w-full min-w-0" : "min-w-[80px] w-[15%]",
        )}
      >
        {label}
      </div>
      <div
        className={cn("typo-body-1-regular", stacked && "min-w-0 break-words")}
      >
        {formatter ? formatter(value as T) : String(value ?? "-")}
      </div>
    </div>
  );
}
