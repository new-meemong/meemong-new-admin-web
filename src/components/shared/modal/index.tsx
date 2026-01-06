"use client";

import * as React from "react";

import {
  ModalContextProps,
  ModalProvider
} from "@/components/shared/modal/context";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface ModalProps extends ModalContextProps {
  isOpen: boolean;
  onClickOutside?: () => void;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClickOutside,
  children,
  ...rest
}: ModalProps) {
  const [show, setShow] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShow(true);
      setClosing(false);
    } else {
      setClosing(true);
      const timeout = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !rest.onClose) return;
    const onClose = rest.onClose;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, rest.onClose]);

  if (!show) return null;

  const sizeClass = {
    xs: "max-w-[480px] h-[562px] min-w-[360px]",
    sm: "max-w-[768px] h-[620px]",
    md: "max-w-[1024px] h-[720px] min-w-[768px]",
    lg: "max-w-[1400px] h-[800px] min-w-[1200px]"
  };

  return createPortal(
    <ModalProvider {...rest}>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity",
          closing ? "animate-fade-out" : "animate-fade-in"
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
            sizeClass[rest.size || "sm"]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalProvider>,
    document.body
  );
}
