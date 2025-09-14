"use client";

import React, { useCallback } from "react";
import { Modal } from "@/components/shared/modal";
import { ModalHeader } from "@/components/shared/modal/modal-header";

import { ModalBody } from "@/components/shared/modal/modal-body";
import { useDialog } from "@/components/shared/dialog/context";

import {
  DEFAULT_POPUP_TYPE_BY_USER_TYPE,
  DEFAULT_POPUP_USER_TYPE,
} from "@/constants/popup";
import PopupForm from "@/components/features/popup/popup-form-modal/popup-form";
import {
  useGetPopupDetailQuery,
  usePostPopupImageUploadMutation,
  usePostPopupMutation,
} from "@/queries/popup";
import { IPopupForm } from "@/models/popup";
import { parseImageUrl } from "@/utils/image";
import { toast } from "react-toastify";

interface PopupFormModalProps {
  popupId?: number;
  isOpen: boolean;
  closable?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PopupFormModal({
  popupId,
  isOpen,
  onClose,
  onSubmit,
}: PopupFormModalProps) {
  const dialog = useDialog();

  const postPopupMutation = usePostPopupMutation();
  const postPopupImageUploadMutation = usePostPopupImageUploadMutation();

  const getPopupDetailQuery = useGetPopupDetailQuery(popupId!, {
    enabled: Boolean(popupId),
  });

  const defaultFormData: IPopupForm = {
    userType: DEFAULT_POPUP_USER_TYPE,
    popupType: DEFAULT_POPUP_TYPE_BY_USER_TYPE[DEFAULT_POPUP_USER_TYPE],
    company: "",
    imageUrl: "",
    redirectUrl: "",
    ...getPopupDetailQuery.data,
  };

  const handleSubmit = useCallback(
    async (formData: Partial<IPopupForm & { imageFile: File }>) => {
      try {
        const confirmed = await dialog.confirm("팝업을 추가하시겠습니까?");

        const { imageUrl, imageFile, ...restFormData } = formData;

        if (confirmed) {
          let newImageUrl = imageFile ? undefined : imageUrl;
          if (formData.imageFile) {
            const fd = new FormData();

            fd.append("image", formData.imageFile as Blob);
            const response =
              await postPopupImageUploadMutation.mutateAsync(fd);

            if (response.data?.imageFile?.fileuri) {
              newImageUrl = parseImageUrl(response.data?.imageFile.fileuri);
            } else {
              throw new Error("파일 전송 실패");
            }
          }

          await postPopupMutation.mutateAsync({
            popup: {
              ...restFormData,
              imageUrl: newImageUrl,
            },
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
    [onSubmit, onClose],
  );

  return (
    <Modal isOpen={isOpen} closable={false} size="xs" onClose={onClose}>
      <ModalHeader>팝업 추가</ModalHeader>
      <ModalBody>
        <PopupForm
          formData={defaultFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </ModalBody>
    </Modal>
  );
}
