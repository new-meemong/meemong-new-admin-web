import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {FieldPath, FieldValues, useFormContext} from "react-hook-form";
import { cn } from "@/lib/utils";
import SelectBox from "@/components/shared/select-box";

interface Option {
  label: string;
  value: string;
}

interface CommonFormSelectBoxProps<TFieldValues extends FieldValues> {
  className?: string;
  name: FieldPath<TFieldValues>;
  label: string;
  defaultValue?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function CommonFormSelectBox<TFieldValues extends FieldValues>({
  className,
  name,
  label,
  options,
  placeholder = "선택해주세요",
  disabled = false,
  size = "md",
}: CommonFormSelectBoxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-1 mt-[20px]", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <SelectBox
              className={cn("w-full")}
              options={options}
              value={field.value}
              defaultValue={field.value}
              onChange={({ value }) => field.onChange(value)}
              name={name}
              placeholder={placeholder}
              size={size}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
