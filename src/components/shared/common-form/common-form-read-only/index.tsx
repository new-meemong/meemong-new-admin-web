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

interface CommonFormReadonlyProps {
  name: string;
  label: string;
  value?: string | number | boolean;
  formatter?: (value: string | number | boolean) => React.ReactNode;
  className?: string;
}

export function CommonFormReadonly({
  name,
  label,
  value,
  formatter,
  className,
}: CommonFormReadonlyProps) {
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem className={cn("flex flex-row border-b py-[6px]", className)}>
          <FormLabel className="min-w-[80px] shrink-0">{label}</FormLabel>
          <FormControl>
            <div className="typo-body-2-regular">
              {formatter && value ? formatter(value) : String(value ?? "-")}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
