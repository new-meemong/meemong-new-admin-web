"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardHeaderTabOption<T extends string> {
  value: T;
  label: string;
}

interface DashboardHeaderTabGroupProps<T extends string> {
  className?: string;
  options: DashboardHeaderTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  itemClassName?: string;
}

function DashboardHeaderTabGroup<T extends string>({
  className,
  options,
  value,
  onChange,
  itemClassName,
}: DashboardHeaderTabGroupProps<T>) {
  const handleClick = useCallback(
    (nextValue: T) => {
      onChange(nextValue);
    },
    [onChange],
  );

  return (
    <span
      className={cn("dashboard-header-tab-group flex gap-[5px]", className)}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          className={cn(
            "w-[126px]",
            value === option.value &&
              "bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
            itemClassName,
          )}
          variant={"outline"}
          value={option.value}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </span>
  );
}

export default DashboardHeaderTabGroup;
