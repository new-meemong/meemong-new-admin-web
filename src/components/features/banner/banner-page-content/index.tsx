"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import BannerSearchForm, {
  IBannerSearchParams,
} from "@/components/features/banner/banner-search-form";
import BannerTable from "@/components/features/banner/banner-table";
import { useGetBannersQuery } from "@/queries/banners";

interface BannerPageContentProps {
  className?: string;
}

function BannerPageContent({ className }: BannerPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IBannerSearchParams = {
    company: "",
    ...DEFAULT_PAGINATION,
  };

  const methods = useSearchMethods<IBannerSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const getBannersQuery = useGetBannersQuery({
    company: methods.params.company,
    page: methods.params.page,
    size: methods.params.size,
  });

  useEffect(() => {
    getBannersQuery.refetch();
  }, [methods.searchParams]);

  return (
    <div className={cn("banner-page-content", className)}>
      <BannerSearchForm
        methods={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <BannerTable
        data={getBannersQuery.data?.content ?? []}
        totalCount={getBannersQuery.data?.totalCount ?? 0}
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        onPageChange={(page) => {
          methods.handleChangePage(page);
        }}
        onSizeChange={(size) => {
          methods.handleChangeSize(size);
        }}
      />
    </div>
  );
}

export default BannerPageContent;
