"use client";

import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import PopupSearchForm from "@/components/features/popup/popup-search-form";
import PopupTable from "@/components/features/popup/popup-table";
import { useGetPopupQuery } from "@/queries/popup";
import { usePopupContext } from "@/components/contexts/popup-context";
import { PopupUserType } from "@/constants/popup";

interface PopupPageContentProps {
  className?: string;
}

function PopupPageContent({ className }: PopupPageContentProps) {
  const { popupTabValues } = usePopupContext();

  // 탭이 바뀔 때 초기 파라미터 생성 (page/size 초기값은 DEFAULT_PAGINATION)
  const defaultParams = useMemo(
    () => ({
      userType: popupTabValues.userType,
      popupType: popupTabValues.popupType,
      ...DEFAULT_PAGINATION, // page, size
    }),
    [popupTabValues.userType, popupTabValues.popupType],
  );

  const methods = useSearchMethods({
    defaultParams,
  });

  // 🔑 쿼리는 searchParams(제출된 값) 기준으로만 수행
  const getPopupQuery = useGetPopupQuery(
    {
      userType: methods.params.userType! as PopupUserType,
      popupType: methods.params.popupType! as string,
      page: methods.params.page as number,
      size: methods.params.size as number,
    },
    {
      enabled: Boolean(methods.params.userType && methods.params.popupType),
    },
  );

  useEffect(() => {
    methods.setParams((prev) => ({ ...prev, ...popupTabValues, page: 1 }));
  }, [popupTabValues]);

  return (
    <div className={cn("popup-page-content", className)}>
      <PopupSearchForm
        onRefresh={() => {
          console.log("refresh");
          getPopupQuery.refetch();
        }}
      />
      <PopupTable
        data={getPopupQuery.data?.content ?? []}
        totalCount={getPopupQuery.data?.totalCount ?? 0}
        currentPage={(methods.params.page as number) ?? 1}
        pageSize={(methods.params.size as number) ?? DEFAULT_PAGINATION.size}
        onRefresh={() => {
          getPopupQuery.refetch();
        }}
        onPageChange={(page) => {
          // 방어: 숫자 보장 + 동일값 early return은 훅이 처리하므로 여기서는 그대로 전달
          const next = Number(page);
          if (Number.isFinite(next)) methods.handleChangePage(next);
        }}
        onSizeChange={(size) => {
          const next = Number(size);
          if (Number.isFinite(next) && next > 0) methods.handleChangeSize(next);
        }}
      />
    </div>
  );
}

export default PopupPageContent;
