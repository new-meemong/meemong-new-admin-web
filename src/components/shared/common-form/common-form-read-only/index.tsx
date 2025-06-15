// common-form-read-only.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface CommonFormReadonlyProps<T> {
  name: string;
  label: string;
  value?: T;
  formatter?: (value: T) => React.ReactNode;
  className?: string;
}

export function CommonFormReadonly<T>({
  name,
  label,
  value,
  formatter,
  className,
}: CommonFormReadonlyProps<T>) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-col mt-[20px]", className)}>
          <FormLabel className="w-full shrink-0 text-foreground-strong">
            {label}
          </FormLabel>
          <FormControl>
            <div className="typo-body-2-regular">
              {formatter ? formatter(value as T) : String(value ?? "-")}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
