"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { useGetContentsQuery } from "@/queries/contents";
import {
  ApproveType,
  CostType,
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import ContentsSearchForm, {
  IContentsSearchParams,
} from "@/components/features/contents/contents-search-form";
import ContentsTable from "@/components/features/contents/contents-table";
import { useContentsContext } from "@/components/contexts/contents-context";
import { UserRoleType } from "@/models/user";

interface ContentsPageContentProps {
  className?: string;
}

function ContentsPageContent({ className }: ContentsPageContentProps) {
  const { tabId } = useContentsContext();

  const DEFAULT_SEARCH_PARAMS: IContentsSearchParams = {
    categoryId: Number(tabId),
    role: "ALL",
    approveType: "ALL",
    company: "",
    jobCategory: "ALL",
    recruitment: "ALL",
    costType: "ALL",
    searchType: "UID",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
  };

  const [searchParams, setSearchParams] = useState<IContentsSearchParams>(
    DEFAULT_SEARCH_PARAMS,
  );

  const methods = useSearchMethods<IContentsSearchParams>({
    defaultValues: DEFAULT_SEARCH_PARAMS,
  });

  const getContentsQuery = useGetContentsQuery({
    categoryId: searchParams.categoryId,
    company: searchParams.company ?? "",
    role:
      searchParams.role === "ALL"
        ? undefined
        : (Number(searchParams.role) as UserRoleType),
    approveType:
      searchParams.approveType === "ALL"
        ? undefined
        : (searchParams.approveType as ApproveType),
    costType:
      searchParams.costType === "ALL"
        ? undefined
        : (searchParams.costType as CostType),
    recruitment:
      searchParams.recruitment === "ALL"
        ? undefined
        : (searchParams.recruitment as RecruitmentType),
    jobCategory:
      searchParams.jobCategory === "ALL"
        ? undefined
        : (searchParams.jobCategory as JobCategoryType),
    searchKeyword: searchParams.searchKeyword,
    page: searchParams.page,
    size: searchParams.size,
  });

  useEffect(() => {
    setSearchParams({
      ...searchParams,
      page: 1,
    });
  }, [tabId]);

  return (
    <div className={cn("contents-page-content", className)}>
      <ContentsSearchForm
        methods={methods}
        onSubmit={() => {
          setSearchParams({ ...methods.values, page: 1 });
        }}
        onRefresh={() => {
          methods.handleReset();
          setSearchParams({ ...DEFAULT_SEARCH_PARAMS });
        }}
      />
      <ContentsTable
        data={getContentsQuery.data?.content ?? []}
        totalCount={getContentsQuery.data?.totalCount ?? 0}
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

export default ContentsPageContent;
