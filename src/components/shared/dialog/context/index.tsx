"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";
import { Dialog } from "@/components/shared/dialog";

type DialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  size?: "sm" | "md";
};

type DialogContextType = {
  alert: (
    message: ReactNode,
    options?: Omit<DialogOptions, "showCancel">,
  ) => Promise<void>;
  confirm: (message: ReactNode, options?: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [resolve, setResolve] = useState<(value: unknown) => void>(() => {});
  const [options, setOptions] = useState<
    DialogOptions & { message: ReactNode }
  >({
    message: "",
    showCancel: true,
  });

  const alert = (
    message: ReactNode,
    opts?: Omit<DialogOptions, "showCancel">,
  ): Promise<void> => {
    return new Promise((res) => {
      setOptions({ ...opts, message, showCancel: false });
      setResolve(() => res);
      setOpen(true);
    });
  };

  const confirm = (
    message: ReactNode,
    opts?: DialogOptions,
  ): Promise<boolean> => {
    return new Promise((res) => {
      setOptions({ ...opts, message, showCancel: true });
      setResolve(() => res);
      setOpen(true);
    });
  };

  const handleConfirm = () => {
    resolve(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolve(false);
    setOpen(false);
  };

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Dialog
        isOpen={open}
        title={options.title}
        description={options.message}
        confirmText={options.confirmText ?? "확인"}
        cancelText={options.cancelText ?? "취소"}
        showCancel={options.showCancel}
        size={options.size}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
};
