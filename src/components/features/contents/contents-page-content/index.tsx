"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { UserType } from "@/models/user";
import { useGetContentsQuery } from "@/queries/contents";
import { GetContentsRequest } from "@/apis/contents";
import {
  ContentsCategoryType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import ContentsSearchForm from "@/components/features/contents/contents-search-form";
import ContentsTable from "@/components/features/contents/contents-table";

interface ContentsPageContentProps {
  className?: string;
}

function ContentsPageContent({ className }: ContentsPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const searchForm = useSearchForm<GetContentsRequest>({
    defaultValues: {
      categoryId: 0,
      company: "",
      userType: "ALL",
      costType: "ALL",
      recruitment: "ALL",
      jobCategory: "ALL",
      searchKeyword: "",
    },
  });

  const getContentsQuery = useGetContentsQuery({
    page: currentPage - 1,
    size: DEFAULT_PAGE_SIZE,
    categoryId: searchForm.values.categoryId,
    company: searchForm.values.company ?? "",
    userType:
      searchForm.values.userType === "ALL"
        ? undefined
        : (searchForm.values.userType as UserType),
    costType:
      searchForm.values.costType === "ALL"
        ? undefined
        : (searchForm.values.costType as CostType),
    recruitment:
      searchForm.values.recruitment === "ALL"
        ? undefined
        : (searchForm.values.recruitment as RecruitmentType),
    jobCategory:
      searchForm.values.jobCategory === "ALL"
        ? undefined
        : (searchForm.values.jobCategory as JobCategoryType),
    searchKeyword: searchForm.values.searchKeyword,
  });

  return (
    <div className={cn("contents-page-content", className)}>
      <ContentsSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
        onRefresh={() => {}}
        onChangeCategory={() => {
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
      />
      <ContentsTable
        categoryId={String(searchForm.values.categoryId) as ContentsCategoryType}
        data={getContentsQuery.data?.content ?? []}
        totalCount={getContentsQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSizeChange={() => {}}
      />
    </div>
  );
}

export default ContentsPageContent;
