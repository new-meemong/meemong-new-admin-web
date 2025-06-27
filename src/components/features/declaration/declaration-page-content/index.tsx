"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchMethods";
import DeclarationSearchForm, {
  IDeclarationSearchParams,
} from "@/components/features/declaration/declaration-search-form";
import { useGetDeclarationsQuery } from "@/queries/declaration";
import DeclarationTable from "@/components/features/declaration/declaration-table";
import { DeclarationStatusType } from "@/constants/declaration";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";

interface DeclarationPageContentProps {
  className?: string;
}

function DeclarationPageContent({ className }: DeclarationPageContentProps) {
  const DEFAULT_SEARCH_PARAMS: IDeclarationSearchParams = {
    status: "ALL",
    searchType: "UID",
    searchKeyword: "",
    ...DEFAULT_PAGINATION,
  };

  const [searchParams, setSearchParams] = useState<IDeclarationSearchParams>(
    DEFAULT_SEARCH_PARAMS,
  );

  const searchForm = useSearchForm<IDeclarationSearchParams>({
    defaultValues: DEFAULT_SEARCH_PARAMS,
  });

  const getDeclarationsQuery = useGetDeclarationsQuery({
    status:
      searchParams.status === "ALL"
        ? undefined
        : (searchParams.status as DeclarationStatusType),
    searchType: searchParams.searchType,
    searchKeyword: searchParams.searchKeyword,
    page: searchParams.page,
    size: searchParams.size,
  });

  return (
    <div className={cn("contents-page-content", className)}>
      <DeclarationSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setSearchParams({ ...searchParams, page: 1 });
        }}
        onRefresh={() => {
          searchForm.handleReset();
          setSearchParams({ ...DEFAULT_SEARCH_PARAMS });
        }}
      />
      <DeclarationTable
        data={getDeclarationsQuery.data?.content ?? []}
        totalCount={getDeclarationsQuery.data?.totalCount ?? 0}
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

export default DeclarationPageContent;
