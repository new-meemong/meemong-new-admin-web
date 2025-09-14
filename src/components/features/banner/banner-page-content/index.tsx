"use client";

import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import BannerSearchForm from "@/components/features/banner/banner-search-form";
import BannerTable from "@/components/features/banner/banner-table";
import { useGetBannersQuery } from "@/queries/banners";
import { useBannerContext } from "@/components/contexts/banner-context";
import { BannerUserType } from "@/constants/banner";

interface BannerPageContentProps {
  className?: string;
}

function BannerPageContent({ className }: BannerPageContentProps) {
  const { bannerTabValues } = useBannerContext();

  // 탭이 바뀔 때 초기 파라미터 생성 (page/size 초기값은 DEFAULT_PAGINATION)
  const defaultParams = useMemo(
    () => ({
      userType: bannerTabValues.userType,
      bannerType: bannerTabValues.bannerType,
      ...DEFAULT_PAGINATION, // page, size
    }),
    [bannerTabValues.userType, bannerTabValues.bannerType],
  );

  const methods = useSearchMethods({
    defaultParams,
  });

  // 🔑 쿼리는 searchParams(제출된 값) 기준으로만 수행
  const getBannersQuery = useGetBannersQuery(
    {
      userType: methods.params.userType! as BannerUserType,
      bannerType: methods.params.bannerType! as string,
      page: methods.params.page as number,
      size: methods.params.size as number,
    },
    {
      enabled: Boolean(methods.params.userType && methods.params.bannerType),
    },
  );

  useEffect(() => {
    methods.setParams((prev) => ({ ...prev, ...bannerTabValues, page: 1 }));
  }, [bannerTabValues]);

  return (
    <div className={cn("banner-page-content", className)}>
      <BannerSearchForm
        onRefresh={() => {
          console.log("refresh");
          getBannersQuery.refetch();
        }}
      />
      <BannerTable
        data={getBannersQuery.data?.content ?? []}
        totalCount={getBannersQuery.data?.totalCount ?? 0}
        currentPage={(methods.params.page as number) ?? 1}
        pageSize={(methods.params.size as number) ?? DEFAULT_PAGINATION.size}
        onRefresh={() => {
          getBannersQuery.refetch();
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

export default BannerPageContent;
