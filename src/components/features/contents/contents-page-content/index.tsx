"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { UserType } from "@/models/user";
import { useGetContentsQuery } from "@/queries/contents";
import {
  ApproveType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import ContentsSearchForm, {
  IContentsSearchForm,
} from "@/components/features/contents/contents-search-form";
import ContentsTable from "@/components/features/contents/contents-table";
import { useContentsContext } from "@/components/contexts/contents-context";

interface ContentsPageContentProps {
  className?: string;
}

function ContentsPageContent({ className }: ContentsPageContentProps) {
  const { tabId } = useContentsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const DEFAULT_SEARCH_FORM: IContentsSearchForm = {
    categoryId: Number(tabId),
    userType: "ALL",
    approveType: "ALL",
    company: "",
    jobCategory: "ALL",
    recruitment: "ALL",
    costType: "ALL",
    searchType: "UUID",
    searchKeyword: "",
  };

  const searchForm = useSearchForm<IContentsSearchForm>({
    defaultValues: DEFAULT_SEARCH_FORM,
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
    approveType:
      searchForm.values.approveType === "ALL"
        ? undefined
        : (searchForm.values.approveType as ApproveType),
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

  useEffect(() => {
    setCurrentPage(1);
  }, [tabId]);

  return (
    <div className={cn("contents-page-content", className)}>
      <ContentsSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setCurrentPage(1);
        }}
        onRefresh={() => {
          searchForm.handleReset();
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
      />
      <ContentsTable
        data={getContentsQuery.data?.content ?? []}
        totalCount={getContentsQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        pageSize={currentSize}
        onPageChange={setCurrentPage}
        onSizeChange={setCurrentSize}
      />
    </div>
  );
}

export default ContentsPageContent;
