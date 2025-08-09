"use client";

import React, { createContext, useContext, useState } from "react";

interface UsersContextType {
  isPhotoMode: boolean;
  setIsPhotoMode: (value: boolean) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [isPhotoMode, setIsPhotoMode] = useState<boolean>(false);

  return (
    <UsersContext.Provider value={{ isPhotoMode, setIsPhotoMode }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsersContext(): UsersContextType {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
}
