"use client";

import {
  DEFAULT_BANNER_TYPE_BY_USER_TYPE,
  DEFAULT_BANNER_USER_TYPE
} from "@/constants/banner";
import React, { useCallback } from "react";
import {
  usePostBannerImageUploadMutation,
  usePostBannerMutation
} from "@/queries/banners";

import BannerForm from "@/components/features/banner/banner-form-modal/banner-form";
import { IBannerForm } from "@/models/banner";
import { Modal } from "@/components/shared/modal";
import { ModalBody } from "@/components/shared/modal/modal-body";
import { ModalHeader } from "@/components/shared/modal/modal-header";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface BannerFormModalProps {
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function BannerFormModal({
  isOpen,
  onClose,
  onSubmit
}: BannerFormModalProps) {
  const dialog = useDialog();

  const postBannerMutation = usePostBannerMutation();
  const postBannerImageUploadMutation = usePostBannerImageUploadMutation();

  const defaultFormData: IBannerForm = {
    userType: DEFAULT_BANNER_USER_TYPE,
    bannerType: DEFAULT_BANNER_TYPE_BY_USER_TYPE[DEFAULT_BANNER_USER_TYPE],
    imageUrl: "",
    redirectUrl: ""
  };

  const handleSubmit = useCallback(
    async (formData: Partial<IBannerForm & { imageFile: File }>) => {
      try {
        const confirmed = await dialog.confirm("배너를 추가하시겠습니까?");

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

          if (!newImageUrl && !imageUrl) {
            throw new Error("이미지를 선택해주세요.");
          }

          await postBannerMutation.mutateAsync({
            userType: restFormData.userType,
            bannerType: restFormData.bannerType,
            displayType: ".",
            imageUrl: newImageUrl || imageUrl || "",
            redirectUrl: restFormData.redirectUrl,
            endAt: restFormData.endAt
          });

          toast.success("배너를 추가했습니다.");

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
    <Modal
      isOpen={isOpen}
      closable={false}
      size="md"
      onClose={onClose}
      onClickOutside={onClose}
    >
      <ModalHeader>배너 추가하기</ModalHeader>
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
