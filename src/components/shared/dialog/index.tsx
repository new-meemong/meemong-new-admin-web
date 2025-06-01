"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  size?: "sm" | "md";
}

export function Dialog({
  isOpen,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  showCancel = true,
  size = "sm",
}: DialogProps) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-[360px]",
    md: "max-w-[512px]",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl p-6",
          sizeClass[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {description && (
          <p className="text-sm text-gray-700 mb-4">{description}</p>
        )}
        <div className="flex justify-end gap-2 mt-4">
          {showCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
