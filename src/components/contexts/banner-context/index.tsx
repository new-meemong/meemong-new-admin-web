"use client";

import { BannerType, BannerUserType } from "@/constants/banner";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getDefaultBannerTypeForUserType,
  isValidBannerTypeForUserType,
  isValidUserType
} from "@/utils/banner";

import { useSearchParams } from "next/navigation";

interface IBannerTabValues {
  userType?: BannerUserType; // 예: "MODEL" | "DESIGNER" | undefined (전체)
  bannerType?: string; // 해당 userType의 옵션 value | undefined (전체)
}

interface BannerContextType {
  bannerTabValues: IBannerTabValues;
  setBannerTabValues: (bannerTabValues: IBannerTabValues) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const [bannerTabValues, setBannerTabValues] = useState<IBannerTabValues>(
    () => {
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

      // URL 파라미터가 없으면 전체 상태로
      return {
        userType: undefined,
        bannerType: undefined
      };
    }
  );

  useEffect(() => {
    const urlUserType = searchParams.get("userType");
    const urlBannerType = searchParams.get("bannerType");

    if (urlUserType && isValidUserType(urlUserType)) {
      const nextUserType = urlUserType as BannerUserType;
      const nextBannerType =
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
          bannerType: nextBannerType
        });
      }
    } else {
      // URL 파라미터가 없으면 전체 상태로
      if (
        bannerTabValues.userType !== undefined ||
        bannerTabValues.bannerType !== undefined
      ) {
        setBannerTabValues({
          userType: undefined,
          bannerType: undefined
        });
      }
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
    setBannerTabValues
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
