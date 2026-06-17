"use client";

import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import SalonPickProductForm, {
  SalonPickProductFormValues,
} from "@/components/features/salon-pick-products/salon-pick-product-form";
import {
  usePostSalonPickProductImageUploadMutation,
  usePostSalonPickProductMutation,
} from "@/queries/salonPickProducts";
import { ISalonPickProductForm } from "@/models/salonPickProducts";
import {
  getSalonPickProductHairConcernsOrDefault,
  getSalonPickProductTreatmentTypesOrDefault,
  normalizeSalonPickProductPrice,
} from "@/utils/salonPickProducts";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";
import {
  SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  SALON_PICK_PRODUCT_SEX,
} from "@/constants/salonPickProducts";

interface SalonPickProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const defaultFormData: ISalonPickProductForm = {
  productName: "",
  productLinkUrl: SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  originalPrice: "",
  discountPrice: "",
  chipText: "",
  imageUrl: "",
  bannerImageUrl: "",
  sex: SALON_PICK_PRODUCT_SEX.ALL,
  hairConcerns: getSalonPickProductHairConcernsOrDefault(),
  preferredTreatmentTypes: getSalonPickProductTreatmentTypesOrDefault(),
  isActive: false,
};

export default function SalonPickProductFormModal({
  isOpen,
  onClose,
  onSubmit,
}: SalonPickProductFormModalProps) {
  const dialog = useDialog();
  const postSalonPickProductMutation = usePostSalonPickProductMutation();
  const postSalonPickProductImageUploadMutation =
    usePostSalonPickProductImageUploadMutation();
  const isSubmitting =
    postSalonPickProductMutation.isPending ||
    postSalonPickProductImageUploadMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const uploadImage = useCallback(
    async (imageFile?: File, imageUrl?: string) => {
      if (!imageFile) return imageUrl;

      const response =
        await postSalonPickProductImageUploadMutation.mutateAsync(imageFile);
      const uploadedUrl = response.data?.imageFile?.fileUrl;

      if (!uploadedUrl) {
        throw new Error("파일 전송 실패");
      }

      return uploadedUrl;
    },
    [postSalonPickProductImageUploadMutation],
  );

  const handleSubmit = useCallback(
    async (formData: SalonPickProductFormValues) => {
      try {
        const confirmed = await dialog.confirm("신규 슬롯을 생성하시겠습니까?");
        if (!confirmed) return;

        const [imageUrl, bannerImageUrl] = await Promise.all([
          uploadImage(formData.imageFile, formData.imageUrl),
          uploadImage(
            formData.bannerImageFile,
            formData.bannerImageUrl ?? undefined,
          ),
        ]);

        await postSalonPickProductMutation.mutateAsync({
          productName: formData.productName,
          productLinkUrl: formData.productLinkUrl,
          originalPrice: normalizeSalonPickProductPrice(formData.originalPrice),
          discountPrice: normalizeSalonPickProductPrice(formData.discountPrice),
          chipText: formData.chipText,
          imageUrl,
          bannerImageUrl: bannerImageUrl || null,
          sex: formData.sex,
          hairConcerns: formData.hairConcerns,
          preferredTreatmentTypes: formData.preferredTreatmentTypes,
          isActive: false,
        });

        toast.success("신규 슬롯을 생성했습니다.");
        onSubmit();
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("잠시 후 다시 시도해주세요.");
      }
    },
    [dialog, onClose, onSubmit, postSalonPickProductMutation, uploadImage],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 pt-[34px]"
      onClick={onClose}
    >
      <div
        className="h-[86vh] max-h-[820px] w-[680px] overflow-hidden rounded-[12px] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <SalonPickProductForm
          formData={defaultFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>,
    document.body,
  );
}
