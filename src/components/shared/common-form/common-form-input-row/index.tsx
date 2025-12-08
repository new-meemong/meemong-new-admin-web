import * as React from "react";

import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommonFormInputRowProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends Omit<React.ComponentProps<"input">, "className" | "size"> {
  className?: string;
  inputClassName?: string;
  name: TName;
  label: string;
  children?: React.ReactNode;
  size?: "md" | "sm";
}

export function CommonFormInputRow<TFieldValues extends FieldValues>({
  className,
  inputClassName,
  name,
  label,
  children,
  ...props
}: CommonFormInputRowProps<TFieldValues, FieldPath<TFieldValues>>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("flex flex-row border-b py-[10px] gap-0", className)}
        >
          <FormLabel className="min-w-[80px] w-[15%] shrink-0 font-medium">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              className={cn("w-full", inputClassName)}
              {...field}
              value={field.value || ""}
              {...props}
            />
          </FormControl>
          {children}
        </FormItem>
      )}
    />
  );
}
