"use client";

import React, { createContext, useContext } from "react";

export interface ModalContextProps extends ModalContextType {
  children: React.ReactNode;
}

interface ModalContextType {
  size?: "xs" | "sm" | "md" | "lg";
  closable?: boolean;
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({
  size,
  closable,
  onClose,
  children,
}: ModalContextProps) => {
  return (
    <ModalContext.Provider value={{ size, closable, onClose }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = (): ModalContextType => {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error("useModalContext must be used within a ModalProvider");
  return ctx;
};
