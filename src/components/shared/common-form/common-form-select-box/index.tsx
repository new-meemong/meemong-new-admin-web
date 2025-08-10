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
  defaultValue,
}: CommonFormSelectBoxProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const { field } = useController({ name, control }); // ✅ 훅은 컴포넌트 최상위

  const selectedOption = useMemo(
    () => options.find((o) => o.value === (field.value as string)) ?? null,
    [options, field.value],
  );

  // 폼 값이 비어 있고 defaultValue가 있을 때 1회 세팅
  useEffect(() => {
    if ((field.value ?? "") === "" && defaultValue) {
      // defaultValue가 options에 존재할 때만 세팅
      if (options.some((o) => o.value === defaultValue)) {
        field.onChange(defaultValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, options.length]); // options 전체가 아니라 length만 의존(불필요 재실행 방지)

  // 옵션 변경으로 현재 값이 유효하지 않게 되면 초기화(선택)
  useEffect(() => {
    const v = field.value as string | undefined | null;
    if (v && !options.some((o) => o.value === v)) {
      field.onChange(""); // 또는 null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn("flex flex-col gap-1 mt-[20px]", className)}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <SelectBox
                className={cn("w-full")}
                options={options}
                value={selectedOption?.value}
                defaultValue={field.value}
                onChange={({ value }) => field.onChange(value)}
                name={name}
                placeholder={placeholder}
                size={size}
                disabled={disabled}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
