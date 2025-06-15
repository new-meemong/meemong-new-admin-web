"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchForm";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import DeclarationSearchForm, {
  IDeclarationSearchForm,
} from "@/components/features/declaration/declaration-search-form";
import { useGetDeclarationsQuery } from "@/queries/declaration";
import DeclarationTable from "@/components/features/declaration/declaration-table";
import { DeclarationStatusType } from "@/constants/declaration";

interface DeclarationPageContentProps {
  className?: string;
}

function DeclarationPageContent({ className }: DeclarationPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const DEFAULT_SEARCH_FORM: IDeclarationSearchForm = {
    status: "ALL",
    searchType: "UUID",
    searchKeyword: "",
  };

  const searchForm = useSearchForm<IDeclarationSearchForm>({
    defaultValues: DEFAULT_SEARCH_FORM,
  });

  const getDeclarationsQuery = useGetDeclarationsQuery({
    page: currentPage - 1,
    size: currentSize,
    status:
      searchForm.values.status === "ALL"
        ? undefined
        : (searchForm.values.status as DeclarationStatusType),
    searchType: searchForm.values.searchType,
    searchKeyword: searchForm.values.searchKeyword,
  });

  return (
    <div className={cn("contents-page-content", className)}>
      <DeclarationSearchForm
        searchForm={searchForm}
        onSubmit={() => {
          setCurrentPage(1);
        }}
        onRefresh={() => {
          searchForm.handleReset();
          setCurrentPage(1); // 검색 시 페이지 초기화
        }}
      />
      <DeclarationTable
        data={getDeclarationsQuery.data?.content ?? []}
        totalCount={getDeclarationsQuery.data?.totalCount ?? 0}
        currentPage={currentPage}
        pageSize={currentSize}
        onPageChange={setCurrentPage}
        onSizeChange={setCurrentSize}
      />
    </div>
  );
}

export default DeclarationPageContent;
