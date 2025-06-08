"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { ContentsCategoryType } from "@/models/contents";
import { Button } from "@/components/ui/button";
import { useContentsContext } from "@/components/contexts/contents-context";

interface ContentsTabProps {
  className?: string;
}

function ContentsTab({ className, ...props }: ContentsTabProps) {
  const { tabId, setTabId } = useContentsContext();

  const CATEGORY_TYPE_OPTIONS: {
    value: ContentsCategoryType;
    label: string;
  }[] = [
    { value: "0", label: "번개/일반" },
    { value: "1", label: "번개/프리미엄" },
    { value: "2", label: "구인공고" },
    { value: "3", label: "이력서" },
    { value: "4", label: "모집공고" },
  ];

  const handleClick = useCallback((value: string) => {
    setTabId(value);
  }, []);

  return (
    <div className={cn("contents-tab flex gap-[5px]", className)} {...props}>
      {CATEGORY_TYPE_OPTIONS.map((category, index) => (
        <Button
          key={`contents-tab-${index}`}
          className={cn(
            "w-[126px]",
            tabId === category.value &&
              "bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
          )}
          variant={"outline"}
          value={category.value}
          onClick={() => handleClick(category.value)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

export default ContentsTab;
