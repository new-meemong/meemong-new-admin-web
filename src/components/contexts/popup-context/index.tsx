"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PopupType,
  PopupUserType,
  DEFAULT_POPUP_USER_TYPE,
} from "@/constants/popup";
import {
  getDefaultPopupTypeForUserType,
  isValidPopupTypeForUserType,
  isValidUserType,
} from "@/utils/popup";

interface IPopupTabValues {
  userType: PopupUserType; // 예: "MODEL" | "DESIGNER"
  popupType: string; // 해당 userType의 옵션 value
}

interface PopupContextType {
  popupTabValues: IPopupTabValues;
  setPopupTabValues: (popupTabValues: IPopupTabValues) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const [popupTabValues, setPopupTabValues] = useState<IPopupTabValues>(() => {
    const urlUserType = searchParams.get("userType");
    const urlPopupType = searchParams.get("popupType");

    if (urlUserType && isValidUserType(urlUserType)) {
      const userType = urlUserType as PopupUserType;
      const popupType =
        urlPopupType &&
        isValidPopupTypeForUserType(userType, urlPopupType as PopupType)
          ? (urlPopupType as PopupType)
          : getDefaultPopupTypeForUserType(userType);

      return { userType, popupType };
    }

    // 유효한 userType이 없으면 MODEL(기본)로
    const fallbackUserType = DEFAULT_POPUP_USER_TYPE;
    return {
      userType: fallbackUserType,
      popupType: getDefaultPopupTypeForUserType(fallbackUserType),
    };
  });

  useEffect(() => {
    const urlUserType = searchParams.get("userType");
    const urlPopupType = searchParams.get("popupType");

    const nextUserType: PopupUserType = (
      urlUserType && isValidUserType(urlUserType)
        ? urlUserType
        : DEFAULT_POPUP_USER_TYPE
    ) as PopupUserType;

    const nextPopupType: PopupType =
      urlPopupType &&
      isValidPopupTypeForUserType(nextUserType, urlPopupType as PopupType)
        ? (urlPopupType as PopupType)
        : (getDefaultPopupTypeForUserType(nextUserType) as PopupType);

    if (
      popupTabValues.userType !== nextUserType ||
      popupTabValues.popupType !== nextPopupType
    ) {
      setPopupTabValues({
        userType: nextUserType,
        popupType: nextPopupType,
      });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: PopupContextType = {
    popupTabValues,
    setPopupTabValues,
  };

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopupContext(): PopupContextType {
  const ctx = useContext(PopupContext);
  if (!ctx)
    throw new Error("usePopupContext must be used within a PopupProvider");
  return ctx;
}
