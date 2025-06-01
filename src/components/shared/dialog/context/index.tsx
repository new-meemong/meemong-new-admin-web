"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog } from "@/components/shared/dialog";

type DialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
};

type DialogContextType = {
  alert: (
    message: string,
    options?: Omit<DialogOptions, "showCancel">,
  ) => Promise<void>;
  confirm: (message: string, options?: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [resolve, setResolve] = useState<(value: unknown) => void>(() => {});
  const [options, setOptions] = useState<DialogOptions & { message: string }>({
    message: "",
    showCancel: true,
  });

  const alert = (
    message: string,
    opts?: Omit<DialogOptions, "showCancel">,
  ): Promise<void> => {
    return new Promise((res) => {
      setOptions({ ...opts, message, showCancel: false });
      setResolve(() => res);
      setOpen(true);
    });
  };

  const confirm = (message: string, opts?: DialogOptions): Promise<boolean> => {
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
