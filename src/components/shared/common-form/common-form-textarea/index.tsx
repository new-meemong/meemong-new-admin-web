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
import { CommonForm } from "@/components/shared/common-form";

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
        <FormItem className={cn("flex flex-col mt-[20px] gap-0", className)}>
          <FormLabel className="w-full shrink-0 text-foreground-strong mb-2">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea className={cn('w-full rounded-none resize-none')}  {...field} {...props} />
          </FormControl>
          <CommonForm.ErrorMessage name={name} />
        </FormItem>
      )}
    />
  );
}
