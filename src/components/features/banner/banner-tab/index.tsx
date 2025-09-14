"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBannerContext } from "@/components/contexts/banner-context";
import SwitchButton from "@/components/shared/switch-button";
import {
  BANNER_TYPE_OPTIONS,
  BannerUserType,
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
  USER_TYPE_OPTIONS,
} from "@/constants/banner";

interface BannerTabProps {
  className?: string;
}

function BannerTab({ className, ...props }: BannerTabProps) {
  const { bannerTabValues, setBannerTabValues } = useBannerContext();

  const handleClick = useCallback(
    (value: string) => {
      setBannerTabValues({
        ...bannerTabValues,
        bannerType: value,
      });
    },
    [bannerTabValues],
  );

  return (
    <div className={cn("banners-tab flex gap-[5px]", className)} {...props}>
      <SwitchButton<BannerUserType>
        className={"mr-[20px]"}
        options={USER_TYPE_OPTIONS}
        value={bannerTabValues.userType}
        onChange={(value) => {
          setBannerTabValues({
            ...bannerTabValues,
            userType: value,
            bannerType: DEFAULT_BANNER_TYPE_BY_USER_TYPE[value],
          });
        }}
      />
      {BANNER_TYPE_OPTIONS[bannerTabValues.userType as BannerUserType] &&
        BANNER_TYPE_OPTIONS[bannerTabValues.userType as BannerUserType]?.map(
          (bannerType, index) => (
            <Button
              key={`banners-tab-${index}`}
              className={cn(
                "w-[126px]",
                bannerTabValues.bannerType === bannerType.value &&
                  "bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
              )}
              variant={"outline"}
              value={bannerType.value}
              onClick={() => handleClick(bannerType.value)}
            >
              {bannerType.label}
            </Button>
          ),
        )}
    </div>
  );
}

export default BannerTab;
