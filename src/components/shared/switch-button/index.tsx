"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface SwitchButtonProps<K> {
  id?: string;
  options: { label: string; value: K }[];
  value: K | undefined;
  onChange: (value: K) => void;
  className?: string;
}

function SwitchButton<K>({
  id,
  options,
  value,
  onChange,
  className
}: SwitchButtonProps<K>) {
  const [selectedValue, setSelectedValue] = useState<K | undefined>(value);

  // value prop과 내부 상태 동기화
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleClick = useCallback(
    (value: K) => {
      setSelectedValue(value);
      onChange(value);
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "flex flex-row border bg-background hover:bg-background-label rounded-md typo-body-2-regular whitespace-nowrap",
        className
      )}
    >
      {options.map((option, index) => (
        <div
          key={`switch-button-${id}-${index}`}
          className={cn("px-4 py-2 text-center cursor-pointer min-w-[92px]", {
            "cursor-default bg-secondary-background text-secondary-foreground hover:bg-secondary-background":
              option.value === selectedValue && "bg-foreground"
          })}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

export default SwitchButton;
