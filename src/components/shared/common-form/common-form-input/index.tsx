import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CommonForm } from "@/components/shared/common-form";
import React from "react";

interface CommonFormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends InputProps {
  className?: string;
  labelClassName?: string;
  name: TName;
  label: string;
  readOnly?: boolean;
  align?: "column" | "row";
  /** isRow일 때 라벨 고정 너비(px). 기본 60 */
  labelWidthPx?: number;
}

export function CommonFormInput<TFieldValues extends FieldValues>({
  className,
  labelClassName,
  name,
  label,
  readOnly = false,
  align = "column",
  labelWidthPx = 60,
  ...props
}: CommonFormInputProps<TFieldValues, FieldPath<TFieldValues>>) {
  const { control } = useFormContext<TFieldValues>();
  const isRow = align === "row";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "mt-[20px]",
            isRow ? "grid gap-x-3 gap-y-0" : "flex flex-col",
            className,
          )}
          style={
            isRow
              ? ({
                  ["--label-w"]: `${labelWidthPx}px`,
                  gridTemplateColumns: "var(--label-w) 1fr",
                  gridTemplateRows: "auto auto",
                } as React.CSSProperties)
              : undefined
          }
        >
          <FormLabel
            className={cn(
              "shrink-0 text-foreground-strong",
              isRow
                ? "col-[1] row-[1] w-[var(--label-w)] text-right self-center"
                : "w-full",
              labelClassName,
            )}
          >
            {label}
          </FormLabel>
          <div
            className={cn(
              isRow ? "col-[2] row-[1] w-full min-w-0 self-center" : "w-full",
            )}
          >
            <FormControl>
              <Input
                className={cn(
                  "w-full rounded-6 min-w-0",
                  isRow && "rounded-none",
                )}
                {...field}
                value={field.value || ""}
                readOnly={readOnly}
                size="sm"
                {...props}
              />
            </FormControl>
          </div>
          <div
            className={cn(
              isRow ? "col-[2] row-[2] w-full min-w-0 self-start" : "w-full",
            )}
          >
            <CommonForm.ErrorMessage name={name} />
          </div>
        </FormItem>
      )}
    />
  );
}
