// src/components/ui/form-message.tsx
"use client";

import * as React from "react";
import { FieldPath, FieldValues, useFormContext, get } from "react-hook-form";
import { cn } from "@/lib/utils";

export type CommonFormErrorMessageProps<
  TFieldValues extends FieldValues = FieldValues,
> = {
  message?: React.ReactNode;
  name?: FieldPath<TFieldValues>;
  icon?: React.ReactNode;
  className?: string;
  preserveSpace?: boolean;
};

export function CommonFormErrorMessage<
  TFieldValues extends FieldValues = FieldValues,
>({
  message,
  name,
  className,
  preserveSpace = false,
}: CommonFormErrorMessageProps<TFieldValues>) {
  const form = useFormContext<TFieldValues>();

  let resolved: React.ReactNode = message;

  if (!resolved && name && form) {
    const err = get(form.formState.errors, name) as
      | { message?: React.ReactNode }
      | undefined;

    resolved = err?.message;
  }

  if (!resolved && !preserveSpace) return null;

  return (
    <p
      role={resolved ? "alert" : undefined}
      className={cn(
        "mt-1 flex items-start gap-1 text-negative text-[12px] leading-[18px]",
        className,
        !resolved && preserveSpace && "invisible",
      )}
    >
      <span>{resolved ?? " "}</span>
    </p>
  );
}
