"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import { useGetUsersQuery } from "@/queries/users";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import BannerSearchForm, {
  BannerSearchFormValues,
} from "@/components/features/banner/banner-search-form";
import BannerTable from "@/components/features/banner/banner-table";
import { useGetBannersQuery } from "@/queries/banner";

interface BannerPageContentProps {
  className?: string;
}

function BannerPageContent({ className }: BannerPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const searchForm = useSearchForm<BannerSearchFormValues>({
    defaultValues: {
      searchKeyword: "",
    },
  });

  const getBannersQuery = useGetBannersQuery({
    page: currentPage - 1,
    size: DEFAULT_PAGE_SIZE,
    searchKeyword: searchForm.values.searchKeyword,
  });

  return (
    <div className={cn("banner-page-content", className)}>
      <BannerSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
      />
      <BannerTable
        data={getBannersQuery.data?.content ?? []}
        totalCount={getBannersQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default BannerPageContent;
