"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface CommonFormReadonlyRowProps<T> {
  name: string;
  label: string;
  value?: T;
  formatter?: (value: T) => React.ReactNode;
  className?: string;
}

export function CommonFormReadonlyRow<T>({
  name,
  label,
  value,
  formatter,
  className,
}: CommonFormReadonlyRowProps<T>) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-row border-b py-[10px]", className)}>
          <FormLabel className="min-w-[80px] w-[15%] shrink-0">
            {label}
          </FormLabel>
          <FormControl>
            <div className="typo-body-1-regular">
              {formatter && value ? formatter(value) : String(value ?? "-")}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
