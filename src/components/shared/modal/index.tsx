"use client";

import * as React from "react";

import {
  ModalContextProps,
  ModalProvider,
} from "@/components/shared/modal/context";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// 중첩 모달은 닫히는 순서와 무관하게 마지막 모달이 사라질 때 잠금을 해제합니다.
let scrollLockCount = 0;
let originalBodyOverflow = "";

interface ModalProps extends ModalContextProps {
  isOpen: boolean;
  /** Keep the current form mounted while a related detail modal is displayed. */
  suspended?: boolean;
  onClickOutside?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  suspended = false,
  onClickOutside,
  children,
  className,
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
    if (!isOpen || suspended || !rest.onClose) return;
    const onClose = rest.onClose;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, suspended, rest.onClose]);

  // 모달이 보이는 동안(닫힘 애니메이션 포함) 배경 페이지로 스크롤이 넘어가지 않게 잠급니다.
  React.useEffect(() => {
    if (!show) return;
    if (scrollLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;
    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [show]);

  if (!show) return null;

  const sizeClass = {
    xs: "max-w-[480px] h-[562px] min-w-[360px]",
    sm: "max-w-[768px] h-[620px]",
    md: "max-w-[1024px] h-[720px] min-w-[768px]",
    lg: "max-w-[1400px] h-[800px] min-w-[1200px]",
  };

  return createPortal(
    <ModalProvider {...rest}>
      <div
        aria-hidden={suspended || undefined}
        style={suspended ? { display: "none" } : undefined}
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
            sizeClass[rest.size || "sm"],
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalProvider>,
    document.body,
  );
}
