"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CommonForm } from "@/components/shared/common-form";
import { Form } from "@/components/ui/form";
import SalonPickProductImageField from "@/components/features/salon-pick-products/salon-pick-product-image-field";
import {
  MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT,
  SALON_PICK_PRODUCT_CURSOR_ORDER,
  SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  SALON_PICK_PRODUCT_PAGE_SIZE,
} from "@/constants/salonPickProducts";
import {
  salonPickProductsQueryKeys,
  useDeleteSalonPickProductMutation,
  useGetSalonPickProductDetailQuery,
  useGetSalonPickProductsQuery,
  usePostSalonPickProductImageUploadMutation,
  usePutSalonPickProductMutation,
} from "@/queries/salonPickProducts";
import {
  getSalonPickProductLinkUrlErrorMessage,
  getSalonPickProductLinkUrlOrDefault,
  getSalonPickProductPreviousDayClickCount,
  getSalonPickProductTotalClickCount,
  isSalonPickProductLinkUrl,
  normalizeSalonPickProductPrice,
  sortSalonPickProductCountsByDateDesc,
} from "@/utils/salonPickProducts";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

const imageFileSchema = z
  .custom<File>((value) => value instanceof File, "유효한 파일이 아닙니다.")
  .refine((file) => file.size > 0, "파일이 비어있습니다.")
  .optional();

const salonPickProductDetailSchema = z
  .object({
    productName: z.string().trim().min(1, "제품명을 입력해주세요."),
    productLinkUrl: z
      .string()
      .trim()
      .superRefine((value, context) => {
        const message = getSalonPickProductLinkUrlErrorMessage(value);

        if (message) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message,
          });
        }
      }),
    originalPrice: z.string().trim().min(1, "원가를 입력해주세요."),
    discountPrice: z.string().trim().min(1, "할인가를 입력해주세요."),
    chipText: z.string().trim().min(1, "칩문구를 입력해주세요."),
    imageUrl: z.string().optional(),
    imageFile: imageFileSchema,
  })
  .refine((value) => Boolean(value.imageUrl || value.imageFile), {
    path: ["imageFile"],
    message: "이미지를 등록해주세요.",
  });

type SalonPickProductDetailFormValues = z.infer<
  typeof salonPickProductDetailSchema
>;

const emptyFormValues: SalonPickProductDetailFormValues = {
  productName: "",
  productLinkUrl: SALON_PICK_PRODUCT_LINK_URL_PREFIX,
  originalPrice: "",
  discountPrice: "",
  chipText: "",
  imageUrl: "",
};

export default function SalonPickProductDetailPageContent() {
  const params = useParams<{ salonPickProductId: string }>();
  const router = useRouter();
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const productId = Number(params.salonPickProductId);

  const getSalonPickProductDetailQuery = useGetSalonPickProductDetailQuery(
    productId,
    {
      enabled: Number.isFinite(productId) && productId > 0,
    },
  );
  const getSalonPickProductsQuery = useGetSalonPickProductsQuery(
    {
      __cursorOrder: SALON_PICK_PRODUCT_CURSOR_ORDER.ID_DESC,
      __limit: SALON_PICK_PRODUCT_PAGE_SIZE,
    },
    {
      enabled: false,
    },
  );
  const putSalonPickProductMutation = usePutSalonPickProductMutation();
  const deleteSalonPickProductMutation = useDeleteSalonPickProductMutation();
  const postSalonPickProductImageUploadMutation =
    usePostSalonPickProductImageUploadMutation();

  const product = getSalonPickProductDetailQuery.data;
  const formValues = useMemo<SalonPickProductDetailFormValues>(() => {
    if (!product) return emptyFormValues;

    return {
      productName: product.productName ?? "",
      productLinkUrl: getSalonPickProductLinkUrlOrDefault(
        product.productLinkUrl,
      ),
      originalPrice: product.originalPrice ?? "",
      discountPrice: product.discountPrice ?? "",
      chipText: product.chipText ?? "",
      imageUrl: product.imageUrl ?? "",
    };
  }, [product]);

  const form = useForm<SalonPickProductDetailFormValues>({
    resolver: zodResolver(salonPickProductDetailSchema),
    values: formValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const productLinkUrl = form.watch("productLinkUrl");

  useEffect(() => {
    if (!product) return;

    void form.trigger("productLinkUrl");
  }, [form, product]);

  const handleProductLinkUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue(
        "productLinkUrl",
        getSalonPickProductLinkUrlOrDefault(event.target.value),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        },
      );
    },
    [form],
  );

  const isPending =
    putSalonPickProductMutation.isPending ||
    deleteSalonPickProductMutation.isPending ||
    postSalonPickProductImageUploadMutation.isPending ||
    getSalonPickProductsQuery.isFetching;

  const clickCounts = sortSalonPickProductCountsByDateDesc(
    product?.salonPickProductCounts ?? [],
  );
  const totalClickCount = getSalonPickProductTotalClickCount(product);
  const previousDayClickCount =
    getSalonPickProductPreviousDayClickCount(product);

  const invalidateSalonPickProductQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: salonPickProductsQueryKeys.lists,
      }),
      queryClient.invalidateQueries({
        queryKey: salonPickProductsQueryKeys.detail(productId),
        refetchType: "none",
      }),
    ]);
  };

  const uploadImage = async (imageFile?: File, imageUrl?: string) => {
    if (!imageFile) return imageUrl;

    const response =
      await postSalonPickProductImageUploadMutation.mutateAsync(imageFile);
    const uploadedUrl = response.data?.imageFile?.fileUrl;

    if (!uploadedUrl) {
      throw new Error("파일 전송 실패");
    }

    return uploadedUrl;
  };

  const showMinimumActiveAlert = async () => {
    await dialog.alert("활성화된 슬롯이 최소 2개 이상 유지되어야 합니다.", {
      title: "활성화 해제 불가",
      confirmText: "확인",
      size: "md",
    });
  };

  const getActiveSalonPickProductCount = async () => {
    const result = await getSalonPickProductsQuery.refetch();

    if (result.error) {
      throw result.error;
    }

    return (
      result.data?.content.filter(
        (salonPickProduct) => salonPickProduct.isActive,
      ).length ?? 0
    );
  };

  const handleSubmit = async (formData: SalonPickProductDetailFormValues) => {
    try {
      const confirmed = await dialog.confirm("슬롯 정보를 저장하시겠습니까?");
      if (!confirmed) return;

      const imageUrl = await uploadImage(formData.imageFile, formData.imageUrl);

      await putSalonPickProductMutation.mutateAsync({
        id: productId,
        productName: formData.productName,
        productLinkUrl: formData.productLinkUrl,
        originalPrice: normalizeSalonPickProductPrice(formData.originalPrice),
        discountPrice: normalizeSalonPickProductPrice(formData.discountPrice),
        chipText: formData.chipText,
        imageUrl,
      });

      await invalidateSalonPickProductQueries();
      toast.success("슬롯 정보를 저장했습니다.");
      router.push("/salon-pick-products");
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      if (product.isActive) {
        const nextActiveCount = await getActiveSalonPickProductCount();

        if (nextActiveCount <= MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT) {
          await showMinimumActiveAlert();
          return;
        }
      }

      const confirmed = await dialog.confirm("해당 슬롯을 삭제하시겠습니까?", {
        confirmText: "삭제",
        cancelText: "취소",
      });
      if (!confirmed) return;

      await deleteSalonPickProductMutation.mutateAsync(product.id);
      await invalidateSalonPickProductQueries();
      toast.success("슬롯을 삭제했습니다.");
      router.push("/salon-pick-products");
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  };

  if (getSalonPickProductDetailQuery.isLoading) {
    return (
      <div className="rounded-10 border bg-white p-6 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-10 border bg-white p-6 text-center text-gray-500">
        상품 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="max-w-[1040px] rounded-10 border bg-white px-[32px] py-[28px]"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="grid grid-cols-[1fr_360px] gap-[54px]">
          <section className="min-w-0">
            <h2 className="mb-[24px] typo-title-2-bold text-foreground-strong">
              슬롯 정보
            </h2>
            <SalonPickProductImageField<SalonPickProductDetailFormValues>
              name="imageUrl"
              fileName="imageFile"
              variant="preview"
              className="mb-[26px]"
            />
            <CommonForm.Input
              name="productName"
              label="제품명"
              className="mt-[16px] max-w-[580px]"
            />
            <CommonForm.Input
              name="productLinkUrl"
              label="링크 (URL)"
              placeholder={SALON_PICK_PRODUCT_LINK_URL_PREFIX}
              onChange={handleProductLinkUrlChange}
              className="max-w-[580px]"
            />
            <CommonForm.Input
              name="originalPrice"
              label="원가"
              inputMode="numeric"
              className="max-w-[580px]"
            />
            <CommonForm.Input
              name="discountPrice"
              label="할인가"
              inputMode="numeric"
              className="max-w-[580px]"
            />
            <CommonForm.Input
              name="chipText"
              label="칩문구"
              className="max-w-[580px]"
            />
            <div className="mt-[24px] flex gap-[16px]">
              <Button
                type="submit"
                variant="submit-modal"
                size="lg"
                disabled={
                  isPending || !isSalonPickProductLinkUrl(productLinkUrl)
                }
                className="h-[40px] w-[128px] rounded-6"
              >
                저장하기
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isPending}
                className="h-[40px] w-[100px] rounded-6 border-[#ff4d4f] text-[#ff4d4f] hover:bg-white"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </div>
          </section>
          <section className="min-w-0">
            <h2 className="typo-title-2-bold text-foreground-strong">
              클릭 통계
            </h2>
            <p className="mt-[4px] typo-body-2-regular text-[#8c91a1]">
              매일 오전 4시 기준 갱신
            </p>
            <div className="mt-[18px] flex gap-[12px]">
              <div className="h-[80px] w-[120px] rounded-8 bg-[#f4f6ff] px-[14px] py-[14px]">
                <p className="typo-caption-1-regular text-[#8c91a1]">
                  전체 클릭수
                </p>
                <p className="mt-[8px] text-[24px] font-bold leading-none text-[#2f72ff]">
                  {totalClickCount.toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="h-[80px] w-[120px] rounded-8 bg-[#f4f6ff] px-[14px] py-[14px]">
                <p className="typo-caption-1-regular text-[#8c91a1]">
                  전일 클릭수
                </p>
                <p className="mt-[8px] text-[24px] font-bold leading-none text-[#2f72ff]">
                  {previousDayClickCount.toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
            <h3 className="mt-[40px] typo-title-2-bold text-foreground-strong">
              일별 클릭수 내역
            </h3>
            <p className="mt-[4px] typo-body-2-regular text-[#8c91a1]">
              누적 집계 (매일 오전 4시 기준)
            </p>
            <div className="mt-[14px] overflow-hidden rounded-8">
              <div className="grid h-[34px] grid-cols-2 items-center bg-[#f3f5fc] px-[12px] typo-body-2-semibold text-foreground-strong">
                <span>클릭수</span>
                <span>집계날짜</span>
              </div>
              {clickCounts.length ? (
                clickCounts.map((count) => (
                  <div
                    key={count.id}
                    className="grid h-[26px] grid-cols-2 items-center px-[12px] typo-body-2-regular text-foreground"
                  >
                    <span>{count.dailyClickCount.toLocaleString("ko-KR")}</span>
                    <span>{dayjs(count.date).format("YY.MM.DD")}</span>
                  </div>
                ))
              ) : (
                <div className="px-[12px] py-[14px] typo-body-2-regular text-[#8c91a1]">
                  클릭수 내역이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </form>
    </Form>
  );
}
