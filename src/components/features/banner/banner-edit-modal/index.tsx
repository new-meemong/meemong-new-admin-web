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
      console.log("🟡 BannerEditModal handleSubmit 호출됨");
      console.log("🟡 formData:", formData);
      try {
        console.log("🟡 확인 다이얼로그 표시");
        const confirmed = await dialog.confirm("배너를 수정하시겠습니까?");
        console.log("🟡 확인 결과:", confirmed);

        const { imageUrl, ...restFormData } = formData;
        console.log("🟡 imageUrl:", imageUrl);
        console.log("🟡 restFormData:", restFormData);

        if (confirmed) {
          console.log("🟡 확인됨, 이미지 업로드 시작");
          let newImageUrl: string | undefined = undefined;
          if (formData.imageFile) {
            console.log("🟡 새 이미지 파일 있음, 업로드 시작");
            const fd = new FormData();

            fd.append("image", formData.imageFile as Blob);
            const response =
              await postBannerImageUploadMutation.mutateAsync(fd);
            console.log("🟡 이미지 업로드 응답:", response);

            if (response.data?.imageFile?.fileuri) {
              newImageUrl = parseImageUrl(response.data?.imageFile.fileuri);
              console.log("🟡 새 이미지 URL:", newImageUrl);
            } else {
              throw new Error("파일 전송 실패");
            }
          } else {
            console.log("🟡 새 이미지 파일 없음, 기존 이미지 사용");
          }

          const putRequest: {
            id: number;
            userType?: string;
            bannerType?: string;
            displayType: string;
            imageUrl?: string;
            redirectUrl?: string;
            endAt?: string | null;
          } = {
            id: banner.id,
            ...(restFormData.userType && { userType: restFormData.userType }),
            ...(restFormData.bannerType && {
              bannerType: restFormData.bannerType
            }),
            displayType: ".",
            ...(newImageUrl
              ? { imageUrl: newImageUrl }
              : imageUrl
                ? { imageUrl }
                : {}),
            ...(restFormData.redirectUrl && {
              redirectUrl: restFormData.redirectUrl
            }),
            // endAt이 undefined이면 null을 명시적으로 전달하여 서버에서 삭제하도록 함
            endAt: restFormData.endAt ?? null
          };
          console.log("🟡 PUT 요청 데이터:", putRequest);

          await putBannerMutation.mutateAsync(putRequest);
          console.log("🟡 PUT 요청 성공");

          toast.success("배너를 수정했습니다.");

          onSubmit();
          onClose();
        } else {
          console.log("🟡 사용자가 취소함");
        }
      } catch (error) {
        console.error("🔴 BannerEditModal 에러:", error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [
      dialog,
      postBannerImageUploadMutation,
      putBannerMutation,
      banner.id,
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
