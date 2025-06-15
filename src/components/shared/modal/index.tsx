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
  const [show, setShow] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShow(true);
      setClosing(false);
    } else if (show) {
      setClosing(true);
      const timeout = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!show) return null;

  const sizeClass = {
    sm: "max-w-[768px] h-[620px]",
    md: "max-w-[1024px] h-[720px]",
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity",
        closing ? "animate-fade-out" : "animate-fade-in",
      )}
      onClick={() => {
        if (onClickOutside) {
          onClickOutside();
        }
      }}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl flex flex-col bg-white shadow-xl transition-all",
          "duration-300 ease-out",
          closing ? "animate-modal-out" : "animate-modal-in",
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
