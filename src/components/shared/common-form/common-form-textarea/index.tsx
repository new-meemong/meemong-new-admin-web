import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import * as React from "react";

interface CommonFormTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends React.ComponentProps<"textarea"> {
  className?: string;
  name: TName;
  label: string;
}

export function CommonFormTextarea<TFieldValues extends FieldValues>({
  className,
  name,
  label,
  ...props
}: CommonFormTextareaProps<TFieldValues, FieldPath<TFieldValues>>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row border-b py-[6px]", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} {...props} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
