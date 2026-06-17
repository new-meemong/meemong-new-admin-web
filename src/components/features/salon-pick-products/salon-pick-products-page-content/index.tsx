"use client";

import React, { useMemo } from "react";
import { Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import SalonPickMainButtonStatisticsPanel from "@/components/features/salon-pick-products/salon-pick-main-button-statistics-panel";
import SalonPickProductsSearchForm from "@/components/features/salon-pick-products/salon-pick-products-search-form";
import SalonPickProductsTable from "@/components/features/salon-pick-products/salon-pick-products-table";
import {
  SALON_PICK_MAIN_BUTTON_CURSOR_ORDER,
  SALON_PICK_MAIN_BUTTON_PAGE_SIZE,
} from "@/constants/salonPickMainButtons";
import {
  MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT,
  SALON_PICK_PRODUCT_CURSOR_ORDER,
  SALON_PICK_PRODUCT_PAGE_SIZE,
} from "@/constants/salonPickProducts";
import { useGetSalonPickMainButtonsQuery } from "@/queries/salonPickMainButtons";
import {
  salonPickProductsQueryKeys,
  useDeleteSalonPickProductMutation,
  useGetSalonPickProductsQuery,
  usePutSalonPickProductMutation,
} from "@/queries/salonPickProducts";
import { ISalonPickProduct } from "@/models/salonPickProducts";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useDialog } from "@/components/shared/dialog/context";

interface SalonPickProductsPageContentProps {
  className?: string;
}

export default function SalonPickProductsPageContent({
  className,
}: SalonPickProductsPageContentProps) {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const getSalonPickProductsQuery = useGetSalonPickProductsQuery({
    __cursorOrder: SALON_PICK_PRODUCT_CURSOR_ORDER.ID_DESC,
    __limit: SALON_PICK_PRODUCT_PAGE_SIZE,
  });
  const getSalonPickMainButtonsQuery = useGetSalonPickMainButtonsQuery({
    __cursorOrder: SALON_PICK_MAIN_BUTTON_CURSOR_ORDER.ID_DESC,
    __limit: SALON_PICK_MAIN_BUTTON_PAGE_SIZE,
  });
  const putSalonPickProductMutation = usePutSalonPickProductMutation();
  const deleteSalonPickProductMutation = useDeleteSalonPickProductMutation();

  const products = useMemo(
    () => getSalonPickProductsQuery.data?.content ?? [],
    [getSalonPickProductsQuery.data?.content],
  );
  const activeCount = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  );
  const isPending =
    putSalonPickProductMutation.isPending ||
    deleteSalonPickProductMutation.isPending ||
    getSalonPickProductsQuery.isFetching;

  const showMinimumActiveAlert = async () => {
    await dialog.alert("활성화된 슬롯이 최소 2개 이상 유지되어야 합니다.", {
      title: "활성화 해제 불가",
      confirmText: "확인",
      size: "md",
    });
  };

  const handleChangeActive = async (
    product: ISalonPickProduct,
    isActive: boolean,
  ) => {
    if (
      product.isActive &&
      !isActive &&
      activeCount <= MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT
    ) {
      await showMinimumActiveAlert();
      return;
    }

    try {
      await putSalonPickProductMutation.mutateAsync({
        id: product.id,
        isActive,
      });
      toast.success("활성화 상태를 변경했습니다.");
      await queryClient.invalidateQueries({
        queryKey: salonPickProductsQueryKeys.lists,
      });
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  };

  const handleDelete = async (product: ISalonPickProduct) => {
    if (
      product.isActive &&
      activeCount <= MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT
    ) {
      await showMinimumActiveAlert();
      return;
    }

    const confirmed = await dialog.confirm("해당 슬롯을 삭제하시겠습니까?", {
      confirmText: "삭제",
      cancelText: "취소",
    });
    if (!confirmed) return;

    try {
      await deleteSalonPickProductMutation.mutateAsync(product.id);
      toast.success("슬롯을 삭제했습니다.");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: salonPickProductsQueryKeys.lists,
        }),
        queryClient.invalidateQueries({
          queryKey: salonPickProductsQueryKeys.detail(product.id),
          refetchType: "none",
        }),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className={cn("salon-pick-products-page-content", className)}>
      <div className="mb-[18px] flex h-[40px] items-center gap-[8px] rounded-6 bg-[#eaf3ff] px-[14px] typo-body-2-regular text-[#2f72ff]">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          활성화된 슬롯 중 2개가 앱 메인에 랜덤 노출됩니다. 활성화 슬롯은 최소
          2개 이상 유지되어야 합니다. 클릭 수는 매일 오전 4시 기준으로
          저장됩니다.
        </span>
      </div>
      <SalonPickProductsSearchForm
        className="mb-[14px]"
        onRefresh={() => getSalonPickProductsQuery.refetch()}
      />
      <SalonPickMainButtonStatisticsPanel
        className="mb-[14px]"
        data={getSalonPickMainButtonsQuery.data?.content ?? []}
        isLoading={getSalonPickMainButtonsQuery.isLoading}
        isFetching={getSalonPickMainButtonsQuery.isFetching}
        isError={getSalonPickMainButtonsQuery.isError}
        onRefresh={() => {
          void getSalonPickMainButtonsQuery.refetch();
        }}
      />
      {getSalonPickProductsQuery.isLoading ? (
        <div className="rounded-10 border bg-white p-6 text-center text-gray-500">
          불러오는 중...
        </div>
      ) : (
        <SalonPickProductsTable
          data={products}
          isPending={isPending}
          onChangeActive={handleChangeActive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
