"use client";

import { IBanner, IBannerForm } from "@/models/banner";
import React, { useCallback } from "react";
import {
  usePostBannerImageUploadMutation,
  usePutBannerMutation
} from "@/queries/banners";

import BannerForm from "@/components/features/banner/banner-form-modal/banner-form";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { PutBannerRequest } from "@/apis/banners";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface BannerEditModalProps {
  banner: IBanner;
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BannerEditModal({
  banner,
  isOpen,
  onClose,
  onSubmit
}: BannerEditModalProps) {
  const dialog = useDialog();

  const putBannerMutation = usePutBannerMutation();
  const postBannerImageUploadMutation = usePostBannerImageUploadMutation();

  // IBanner를 IBannerForm으로 변환
  const bannerFormData: IBannerForm = {
    id: banner.id,
    userType: banner.userType,
    bannerType: banner.bannerType,
    displayType: banner.displayType,
    imageUrl: banner.imageUrl,
    redirectUrl: banner.redirectUrl,
    createdAt: banner.createdAt,
    endAt: banner.endAt
  };

  const handleSubmit = useCallback(
    async (formData: Partial<IBannerForm & { imageFile: File }>) => {
      try {
        const confirmed = await dialog.confirm("배너를 수정하시겠습니까?");

        const { imageUrl, ...restFormData } = formData;

        if (confirmed) {
          let newImageUrl: string | undefined = undefined;
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

          const putRequest: PutBannerRequest = {
            id: banner.id,
            ...(restFormData.userType && { userType: restFormData.userType }),
            ...(restFormData.bannerType && {
              bannerType: restFormData.bannerType
            }),
            ...(newImageUrl
              ? { imageUrl: newImageUrl }
              : imageUrl
                ? { imageUrl }
                : {}),
            ...(restFormData.redirectUrl && {
              redirectUrl: restFormData.redirectUrl
            }),
            ...(restFormData.endAt
              ? { endAt: restFormData.endAt }
              : banner.endAt
                ? { endAt: null }
                : {})
          };

          await putBannerMutation.mutateAsync(putRequest);

          toast.success("배너를 수정했습니다.");

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
      putBannerMutation,
      banner.id,
      banner.endAt,
      onSubmit,
      onClose
    ]
  );

  return (
    <Modal
      isOpen={isOpen}
      closable={false}
      size="md"
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>배너 수정하기</ModalHeader>
      <ModalBody>
        <BannerForm
          formData={bannerFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
          readOnly={false}
          submitButtonText="배너수정"
        />
      </ModalBody>
    </Modal>
  );
}
