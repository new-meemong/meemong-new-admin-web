"use client";

import React, { useEffect, useMemo } from "react";

import BannerSearchForm from "@/components/features/banner/banner-search-form";
import BannerTable from "@/components/features/banner/banner-table";
import { BannerUserType } from "@/constants/banner";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { cn } from "@/lib/utils";
import { useBannerContext } from "@/components/contexts/banner-context";
import { useGetBannersQuery } from "@/queries/banners";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";

interface BannerPageContentProps {
  className?: string;
}

function BannerPageContent({ className }: BannerPageContentProps) {
  const { bannerTabValues } = useBannerContext();

  // 탭이 바뀔 때 초기 파라미터 생성
  // useSearchMethods의 BaseParams 타입 요구사항에 맞추기 위해 page, size 포함
  // 단, 실제 API 호출에는 page, size를 전송하지 않음
  // undefined 값은 필터링하여 BaseParams 타입에 맞춤
  const defaultParams = useMemo(
    () => ({
      ...(bannerTabValues.userType && { userType: bannerTabValues.userType }),
      ...(bannerTabValues.bannerType && {
        bannerType: bannerTabValues.bannerType
      }),
      ...DEFAULT_PAGINATION // page, size (내부 상태 관리용)
    }),
    [bannerTabValues.userType, bannerTabValues.bannerType]
  );

  const methods = useSearchMethods({
    defaultParams
  });

  // 🔑 쿼리는 searchParams(제출된 값) 기준으로만 수행
  const userType = methods.params.userType as BannerUserType | undefined;
  const bannerType = methods.params.bannerType as string | undefined;

  const getBannersQuery = useGetBannersQuery(
    {
      userType,
      bannerType,
      // 최근순 정렬 (생성일 기준 내림차순)
      __cursorOrder: "createdAtDesc"
    },
    {
      enabled: true // 전체 조회를 위해 항상 활성화
    }
  );

  const currentPage = Number(methods.params.page ?? DEFAULT_PAGINATION.page);
  const pageSize = Number(methods.params.size ?? DEFAULT_PAGINATION.size);
  const paginatedBanners = useMemo(() => {
    const banners = getBannersQuery.data?.content ?? [];
    const startIndex = (currentPage - 1) * pageSize;
    return banners.slice(startIndex, startIndex + pageSize);
  }, [getBannersQuery.data, currentPage, pageSize]);
  const totalCount = getBannersQuery.data?.content.length ?? 0;

  useEffect(() => {
    methods.setParams((prev) => ({ ...prev, ...bannerTabValues }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerTabValues]); // methods.setParams는 안정적인 참조를 가지므로 의존성에서 제외

  return (
    <div className={cn("banner-page-content", className)}>
      <BannerSearchForm
        onRefresh={() => {
          getBannersQuery.refetch();
        }}
      />
      <BannerTable
        data={paginatedBanners}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
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
