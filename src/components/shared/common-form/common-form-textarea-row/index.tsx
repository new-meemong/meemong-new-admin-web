import * as React from "react";

import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CommonFormTextareaRowProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends Omit<React.ComponentProps<"textarea">, "className"> {
  className?: string;
  textareaClassName?: string;
  name: TName;
  label: string;
  children?: React.ReactNode;
}

export function CommonFormTextareaRow<TFieldValues extends FieldValues>({
  className,
  textareaClassName,
  name,
  label,
  children,
  ...props
}: CommonFormTextareaRowProps<TFieldValues, FieldPath<TFieldValues>>) {
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
            <Textarea
              className={cn("w-full", textareaClassName)}
              {...field}
              {...props}
            />
          </FormControl>
          {children}
        </FormItem>
      )}
    />
  );
}
