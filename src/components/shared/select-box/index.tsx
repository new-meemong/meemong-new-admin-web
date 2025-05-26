"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

type Size = "sm" | "md" | "lg";

export interface SelectBoxProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: ({ key, value }: { key: string; value: string }) => void;
  name: string;
  placeholder?: string;
  size?: Size;
  className?: string;
}

const triggerSizeMap: Record<Size, string> = {
  sm: "w-[262px] h-[30px] px-[15px] py-[5px]",
  md: "w-[262px] h-[36px] px-[15px] py-[8px]",
  lg: "w-[262px] h-[44px] px-[15px] py-[12px]",
};

function SelectBox({
  options,
  value,
  onChange,
  name,
  placeholder = "선택하세요",
  size = "md",
  className,
}: SelectBoxProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange({ key: name, value: val });
    },
    [onChange, name],
  );

  return (
    <Select value={value} onValueChange={handleChange} name={name}>
      <SelectTrigger
        size={size}
        className={cn(triggerSizeMap[size], className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SelectBox;
