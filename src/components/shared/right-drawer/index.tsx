"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle
} from "@/components/ui/drawer";
import React, { ReactNode, useEffect } from "react";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/stores/drawer";

export interface RightDrawerProps {
  className?: string;
  overlayClassName?: string;
  title?: string | React.ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

export default function RightDrawer({
  className,
  overlayClassName,
  title,
  children,
  footer,
  onClose,
  closable = true
}: RightDrawerProps) {
  const { isOpen, setOpen, preventCloseOnOverlayClick } = useDrawer();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onClose) {
          onClose();
        } else {
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, setOpen]);

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={(open) => {
        if (!preventCloseOnOverlayClick || open) {
          setOpen(open);
        }
      }}
    >
      <DrawerPortal>
        <DrawerOverlay
          className={cn("drawer-overlay", overlayClassName)}
          onClick={(e) => {
            if (onClose) {
              onClose();
            } else {
              setOpen(false);
            }
            e.stopPropagation();
          }}
        />
        <DrawerContent className={cn("drawer-content", className)}>
          <DrawerHeader
            className={cn(
              "flex flex-row p-[24px] py-[16px] items-center justify-start gap-[8px] border-b"
            )}
          >
            {closable && onClose && (
              <button
                onClick={onClose}
                className={cn(
                  "relative w-[24px] h-[24px] text-gray-400 cursor-pointer rounded-4",
                  "hover:text-[rgba(0,0,0,0.88)] hover:bg-[rgba(0,0,0,0.06)] transition-all duration-200"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5 mx-auto" />
              </button>
            )}
            <DrawerTitle className={cn("typo-title-1-bold flex flex-row")}>
              {title}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-[24px] flex-1 overflow-y-auto">{children}</div>
          {footer && <DrawerFooter>{footer}</DrawerFooter>}
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
