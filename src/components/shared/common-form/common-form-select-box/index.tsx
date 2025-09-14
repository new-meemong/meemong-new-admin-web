import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import SelectBox from "@/components/shared/select-box";
import { useEffect, useMemo } from "react";

interface Option {
  label: string;
  value: string;
}

interface CommonFormSelectBoxProps<TFieldValues extends FieldValues> {
  className?: string;
  labelClassName?: string;
  name: FieldPath<TFieldValues>;
  label: string;
  defaultValue?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  align?: "row" | "column";
  readOnly?: boolean;
}

export function CommonFormSelectBox<TFieldValues extends FieldValues>({
  className,
  labelClassName,
  name,
  label,
  options,
  placeholder = "선택해주세요",
  disabled = false,
  size = "md",
  defaultValue,
  align = "column",
  readOnly,
}: CommonFormSelectBoxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control });

  const selectedOption = useMemo(
    () => options.find((o) => o.value === (field.value as string)) ?? null,
    [options, field.value],
  );

  // 폼 값 비어 있고 defaultValue가 유효하면 1회 세팅
  useEffect(() => {
    if ((field.value ?? "") === "" && defaultValue) {
      if (options.some((o) => o.value === defaultValue)) {
        field.onChange(defaultValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, options.length]);

  // 옵션 변경으로 현재 값이 무효해지면 초기화
  useEffect(() => {
    const v = field.value as string | undefined | null;
    if (v && !options.some((o) => o.value === v)) {
      field.onChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  const isRow = align === "row";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "mt-[20px]",
            isRow ? "flex flex-row items-center gap-3" : "flex flex-col gap-1",
            className,
          )}
        >
          <FormLabel
            className={cn(
              "text-foreground-strong shrink-0",
              isRow ? "min-w-[60px] text-left" : "w-full",
              labelClassName,
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <SelectBox
              className={cn("w-full", isRow && "flex-1")}
              options={options}
              value={selectedOption?.value}
              defaultValue={field.value}
              onChange={({ value }) => field.onChange(value)}
              name={name}
              placeholder={placeholder}
              size={size}
              disabled={disabled}
              readOnly={readOnly}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
