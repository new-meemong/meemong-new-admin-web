"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ContentsContextType {
  tabId: string;
  setTabId: (id: string) => void;
}

const ContentsContext = createContext<ContentsContextType | undefined>(
  undefined,
);

export function ContentsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTabId = searchParams.get("tabId") ?? "0";
  const [tabId, setTabIdState] = useState<string>(initialTabId);

  const setTabId = (id: string) => {
    setTabIdState(id);

    const params = new URLSearchParams(searchParams);
    params.set("tabId", id);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const urlTabId = searchParams.get("tabId");
    if (urlTabId && urlTabId !== tabId) {
      setTabIdState(urlTabId);
    }
  }, [searchParams]);

  return (
    <ContentsContext.Provider value={{ tabId, setTabId }}>
      {children}
    </ContentsContext.Provider>
  );
}

export function useContentsContext(): ContentsContextType {
  const context = useContext(ContentsContext);
  if (!context) {
    throw new Error(
      "useContentsContext must be used within a ContentsProvider",
    );
  }
  return context;
}
