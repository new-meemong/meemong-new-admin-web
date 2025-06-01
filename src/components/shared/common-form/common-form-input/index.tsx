import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

interface CommonFormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends InputProps {
  className?: string;
  name: TName;
  label: string;
  readOnly?: boolean;
}

export function CommonFormInput<TFieldValues extends FieldValues>({
  className,
  name,
  label,
  readOnly = false,
  ...props
}: CommonFormInputProps<TFieldValues, FieldPath<TFieldValues>>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row border-b py-[6px]", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} readOnly={readOnly} size="sm" {...props} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
