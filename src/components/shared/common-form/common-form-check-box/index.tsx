import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface CommonFormCheckBoxProps<TFieldValues extends FieldValues> {
  className?: string;
  checked?: boolean;
  onChange: (value: boolean) => void;
  name: FieldPath<TFieldValues>;
  label: string;
  checkboxLabel: string;
  disabled?: boolean;
}

export function CommonFormCheckBox<TFieldValues extends FieldValues>({
  className,
  checked,
  onChange,
  name,
  label,
  checkboxLabel,
  disabled = false,
}: CommonFormCheckBoxProps<TFieldValues>) {
  const handleChange = (next: boolean) => {
    onChange(next);
  };
  return (
    <FormField
      name={name}
      render={() => (
        <FormItem
          className={cn("flex flex-row border-b py-[10px] gap-0", className)}
        >
          <FormLabel
            className={cn("min-w-[80px] w-[15%] shrink-0 font-medium")}
          >
            {label}
          </FormLabel>
          <FormControl>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={checked}
                onCheckedChange={handleChange}
                disabled={disabled}
              />
              <span>{checkboxLabel}</span>
            </label>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
