"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/stores/drawer";
import RightDrawer, {
  RightDrawerProps,
} from "@/components/shared/right-drawer";
import { ChevronRight } from "lucide-react";
import BannerDetailForm from "@/components/features/banner/banner-right-drawer/banner-detail-form";
import {
  useGetBannerDetailQuery,
  usePostBannerImageUploadMutation,
  usePutBannerMutation,
} from "@/queries/banners";
import { IBannerForm } from "@/models/banner";
import { useDialog } from "@/components/shared/dialog/context";
import { parseImageUrl } from "@/utils/image";

interface BannerRightDrawerProps extends RightDrawerProps {
  bannerId: number;
  onRefresh: () => void;
}

function BannerRightDrawer({
  className,
  bannerId,
  onRefresh,
  ...props
}: BannerRightDrawerProps) {
  const { closeDrawer, isOpen } = useDrawer();
  const dialog = useDialog();
  const getBannerDetailQuery = useGetBannerDetailQuery(bannerId, {
    enabled: false,
  });

  const putBannerMutation = usePutBannerMutation();
  const postBannerImageUploadMutation = usePostBannerImageUploadMutation();

  const handleUpdateBanner = async (
    formData: Partial<IBannerForm & { imageFile: File }>,
  ) => {
    try {
      const confirmed = await dialog.confirm("배너를 수정하시겠습니까?");

      const { imageUrl, imageFile, ...restFormData } = formData;

      if (confirmed) {
        let newImageUrl = imageFile ? undefined : imageUrl;
        if (formData.imageFile) {
          const fd = new FormData();

          fd.append("image", formData.imageFile as Blob);
          const response = await postBannerImageUploadMutation.mutateAsync(fd);

          if (response.data?.imageFile?.fileuri) {
            newImageUrl = parseImageUrl(response.data?.imageFile.fileuri);
          } else {
            throw new Error("파일 전송 실패");
          }
        }

        await putBannerMutation.mutateAsync({
          id: bannerId,
          banner: {
            ...restFormData,
            imageUrl: newImageUrl,
          },
        });

        closeDrawer();
        onRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getBannerDetailQuery.refetch();
    }
  }, [isOpen]);

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
            handleUpdateBanner(form);
          }}
        />
      ) : (
        <div>...loading</div>
      )}
    </RightDrawer>
  );
}

export default BannerRightDrawer;
