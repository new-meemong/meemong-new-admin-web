"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/components/shared/right-drawer/useDrawer";
import RightDrawer, {
  RightDrawerProps,
} from "@/components/shared/right-drawer";
import { ChevronRight } from "lucide-react";
import BannerDetailForm from "@/components/features/banner/banner-right-drawer/banner-detail-form";
import { useGetBannerDetailQuery } from "@/queries/banner";

interface BannerRightDrawerProps extends RightDrawerProps {
  bannerId: number;
}

function BannerRightDrawer({
  className,
  bannerId,
  ...props
}: BannerRightDrawerProps) {
  const { closeDrawer } = useDrawer();
  const getBannerDetailQuery = useGetBannerDetailQuery(bannerId);

  return (
    <RightDrawer
      className={cn("w-full max-w-[500px]", className)}
      onClose={closeDrawer}
      title={
        <>
          배너 관리 <ChevronRight /> 배너 상세
        </>
      }
      {...props}
    >
      {getBannerDetailQuery.data ? (
        <BannerDetailForm
          formData={getBannerDetailQuery.data!}
          onSubmit={(form) => {
            console.log(form);
            closeDrawer()
          }}
        />
      ) : (
        <div>...loading</div>
      )}
    </RightDrawer>
  );
}

export default BannerRightDrawer;
