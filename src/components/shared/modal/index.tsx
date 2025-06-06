"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClickOutside?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}

export function Modal({
  isOpen,
  onClickOutside,
  children,
  size = "sm",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-[768px] max-h-[620px]",
    md: "max-w-[1024px] max-h-[720px]",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => {
        if (onClickOutside) {
          onClickOutside();
        }
      }}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl flex flex-col bg-white shadow-xl transition-all",
          sizeClass[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
