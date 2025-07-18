"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface CommonFormButtonBoxProps {
  className?: string;
  children?: React.ReactNode;
}

export function CommonFormButtonBox({
  className,
  children,
}: CommonFormButtonBoxProps) {
  return (
    <div
      className={cn(
        "common-form-button-box",
        "w-full flex items-center justify-center mt-[20px] gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
