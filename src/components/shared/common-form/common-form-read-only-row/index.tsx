"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CommonFormReadonlyRowProps<T> {
  label: string;
  value?: T;
  formatter?: (value: T) => React.ReactNode;
  className?: string;
}

// react-hook-form 안씀
export function CommonFormReadonlyRow<T>({
  label,
  value,
  formatter,
  className,
}: CommonFormReadonlyRowProps<T>) {
  return (
    <div className={cn("flex flex-row border-b py-[10px]", className)}>
      <div className="min-w-[80px] w-[15%] shrink-0 font-medium">{label}</div>
      <div className="typo-body-1-regular">
        {formatter ? formatter(value as T) : String(value ?? "-")}
      </div>
    </div>
  );
}
