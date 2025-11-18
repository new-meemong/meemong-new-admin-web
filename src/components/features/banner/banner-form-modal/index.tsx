"use client";

import {
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
  DEFAULT_BANNER_USER_TYPE
} from "@/constants/banner";
import React, { useCallback } from "react";
import {
  useGetBannerDetailQuery,
  usePostBannerImageUploadMutation,
  usePostBannerMutation
} from "@/queries/banners";

import BannerForm from "@/components/features/banner/banner-form-modal/banner-form";
import { IBanner, IBannerForm } from "@/models/banner";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface BannerFormModalProps {
  bannerId?: number;
  banner?: IBanner;
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BannerFormModal({
  bannerId,
  banner,
  isOpen,
  onClose,
  onSubmit
}: BannerFormModalProps) {
  const dialog = useDialog();

  const postBannerMutation = usePostBannerMutation();
  const postBannerImageUploadMutation = usePostBannerImageUploadMutation();

  // banner prop이 있으면 API 호출하지 않음
  const getBannerDetailQuery = useGetBannerDetailQuery(bannerId!, {
    enabled: Boolean(bannerId) && !banner
  });

  // IBanner를 IBannerForm으로 변환
  const bannerFormData: IBannerForm | undefined = banner
    ? {
        id: banner.id,
        company: banner.company,
        userType: banner.userType,
        bannerType: banner.bannerType,
        displayType: banner.displayType,
        imageUrl: banner.imageUrl,
        redirectUrl: banner.redirectUrl,
        createdAt: banner.createdAt,
        endAt: banner.endAt
      }
    : getBannerDetailQuery.data;

  const defaultFormData: IBannerForm = {
    userType: DEFAULT_BANNER_USER_TYPE,
    bannerType: DEFAULT_BANNER_TYPE_BY_USER_TYPE[DEFAULT_BANNER_USER_TYPE],
    company: "",
    imageUrl: "",
    redirectUrl: "",
    ...bannerFormData
  };

  const handleSubmit = useCallback(
    async (formData: Partial<IBannerForm & { imageFile: File }>) => {
      try {
        const confirmed = await dialog.confirm("배너를 교체하시겠습니까?");

        const { imageUrl, imageFile, ...restFormData } = formData;

        if (confirmed) {
          let newImageUrl = imageFile ? undefined : imageUrl;
          if (formData.imageFile) {
            const fd = new FormData();

            fd.append("image", formData.imageFile as Blob);
            const response =
              await postBannerImageUploadMutation.mutateAsync(fd);

            if (response.data?.imageFile?.fileuri) {
              newImageUrl = parseImageUrl(response.data?.imageFile.fileuri);
            } else {
              throw new Error("파일 전송 실패");
            }
          }

          if (
            !restFormData.userType ||
            !restFormData.bannerType ||
            !restFormData.redirectUrl
          ) {
            throw new Error("필수 필드가 누락되었습니다.");
          }

          await postBannerMutation.mutateAsync({
            userType: restFormData.userType,
            bannerType: restFormData.bannerType,
            displayType: restFormData.displayType,
            imageUrl: newImageUrl || "",
            redirectUrl: restFormData.redirectUrl
          });

          toast.success("배너를 교체했습니다.");

          onSubmit();
          onClose();
        }
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [
      dialog,
      postBannerImageUploadMutation,
      postBannerMutation,
      onSubmit,
      onClose
    ]
  );

  return (
    <Modal isOpen={isOpen} closable={false} size="xs" onClose={onClose}>
      <ModalHeader>배너 교체하기</ModalHeader>
      <ModalBody>
        <BannerForm
          formData={defaultFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </ModalBody>
    </Modal>
  );
}
