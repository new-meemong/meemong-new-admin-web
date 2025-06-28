"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import BannerSearchForm, {
  IBannerSearchParams,
} from "@/components/features/banner/banner-search-form";
import BannerTable from "@/components/features/banner/banner-table";
import { useGetBannersQuery } from "@/queries/banner";

interface BannerPageContentProps {
  className?: string;
}

function BannerPageContent({ className }: BannerPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IBannerSearchParams = {
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
  };

  const [searchParams, setSearchParams] = useState<IBannerSearchParams>(
    DEFAULT_SEARCH_PARAMS,
  );

  const methods = useSearchMethods<IBannerSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const getBannersQuery = useGetBannersQuery({
    searchKeyword: searchParams.searchKeyword,
    page: searchParams.page,
    size: searchParams.size,
  });

  return (
    <div className={cn("banner-page-content", className)}>
      <BannerSearchForm
        methods={methods}
        onSubmit={() => {
          setSearchParams({ ...methods.params, page: 1 });
        }}
        onRefresh={() => {
          methods.handleReset();
          setSearchParams({ ...DEFAULT_SEARCH_PARAMS });
        }}
      />
      <BannerTable
        data={getBannersQuery.data?.content ?? []}
        totalCount={getBannersQuery.data?.totalCount ?? 0}
        currentPage={searchParams.page}
        pageSize={searchParams.size}
        onPageChange={(page) => {
          setSearchParams({
            ...searchParams,
            page,
          });
        }}
        onSizeChange={(size) => {
          setSearchParams({
            ...searchParams,
            page: 1,
            size,
          });
        }}
      />
    </div>
  );
}

export default BannerPageContent;
