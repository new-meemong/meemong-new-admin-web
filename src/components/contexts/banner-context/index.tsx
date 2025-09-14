"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BannerType,
  BannerUserType,
  DEFAULT_BANNER_USER_TYPE,
} from "@/constants/banner";
import {
  getDefaultBannerTypeForUserType,
  isValidBannerTypeForUserType,
  isValidUserType,
} from "@/utils/banner";

interface IBannerTabValues {
  userType: BannerUserType;  // 예: "MODEL" | "DESIGNER"
  bannerType: string;        // 해당 userType의 옵션 value
}

interface BannerContextType {
  bannerTabValues: IBannerTabValues;
  setBannerTabValues: (bannerTabValues: IBannerTabValues) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const [bannerTabValues, setBannerTabValues] = useState<IBannerTabValues>(() => {
    const urlUserType = searchParams.get("userType");
    const urlBannerType = searchParams.get("bannerType");

    if (urlUserType && isValidUserType(urlUserType)) {
      const userType = urlUserType as BannerUserType;
      const bannerType =
        urlBannerType &&
        isValidBannerTypeForUserType(userType, urlBannerType as BannerType)
          ? (urlBannerType as BannerType)
          : getDefaultBannerTypeForUserType(userType);

      return { userType, bannerType };
    }

    // 유효한 userType이 없으면 MODEL(기본)로
    const fallbackUserType = DEFAULT_BANNER_USER_TYPE;
    return {
      userType: fallbackUserType,
      bannerType: getDefaultBannerTypeForUserType(fallbackUserType),
    };
  });

  useEffect(() => {
    const urlUserType = searchParams.get("userType");
    const urlBannerType = searchParams.get("bannerType");

    const nextUserType: BannerUserType = (
      urlUserType && isValidUserType(urlUserType)
        ? urlUserType
        : DEFAULT_BANNER_USER_TYPE
    ) as BannerUserType;

    const nextBannerType: BannerType =
      urlBannerType &&
      isValidBannerTypeForUserType(nextUserType, urlBannerType as BannerType)
        ? (urlBannerType as BannerType)
        : (getDefaultBannerTypeForUserType(nextUserType) as BannerType);

    if (
      bannerTabValues.userType !== nextUserType ||
      bannerTabValues.bannerType !== nextBannerType
    ) {
      setBannerTabValues({
        userType: nextUserType,
        bannerType: nextBannerType,
      });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

/*
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const urlUserType = searchParams.get("userType");
    const urlBannerType = searchParams.get("bannerType");

    if (
      urlUserType === bannerTabValues.userType &&
      urlBannerType === bannerTabValues.bannerType
    ) {
      return;
    }

    params.set("userType", bannerTabValues.userType);
    params.set("bannerType", bannerTabValues.bannerType);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [bannerTabValues, pathname, router, searchParams]);
*/

  const contextValue: BannerContextType = {
    bannerTabValues,
    setBannerTabValues,
  };

  return (
    <BannerContext.Provider value={contextValue}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBannerContext(): BannerContextType {
  const ctx = useContext(BannerContext);
  if (!ctx)
    throw new Error("useBannerContext must be used within a BannerProvider");
  return ctx;
}
