"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogProps {
  isOpen: boolean;
  title?: string;
  description?: React.ReactNode;
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
    md: "max-w-[406px]",
  };
  const isDetailDialog = size === "md";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto bg-black/50"
      onClick={onCancel}
    >
      <div
        className={cn(
          "relative w-full bg-white shadow-xl p-6",
          isDetailDialog ? "rounded-[15px]" : "rounded-xl",
          sizeClass[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2
            className={cn(
              "font-semibold text-black",
              isDetailDialog
                ? "typo-title-1-bold text-center mb-[22px]"
                : "text-lg mb-2",
            )}
          >
            {title}
          </h2>
        )}
        {description && (
          <>
            {typeof description === "string" ? (
              <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
                {description}
              </p>
            ) : (
              <div className={cn(isDetailDialog ? "mb-[22px]" : "mb-4")}>
                {description}
              </div>
            )}
          </>
        )}
        <div
          className={cn(
            "flex gap-2 mt-4",
            isDetailDialog ? "justify-stretch" : "justify-end",
          )}
        >
          {showCancel && (
            <Button
              variant={isDetailDialog ? "negative-modal" : "outline"}
              size={isDetailDialog ? "submit-multi" : "sm"}
              className={cn(isDetailDialog && "max-w-none flex-1 rounded-2")}
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={isDetailDialog ? "submit-modal" : "default"}
            size={isDetailDialog ? "submit-multi" : "sm"}
            className={cn(isDetailDialog && "max-w-none flex-1 rounded-2")}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
