"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import useSearchForm from "@/components/shared/search-form/useSearchMethods";
import DeclarationSearchForm, {
  IDeclarationSearchParams,
} from "@/components/features/declaration/declaration-search-form";
import { useGetDeclarationsQuery } from "@/queries/declaration";
import DeclarationTable from "@/components/features/declaration/declaration-table";
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

  const methods = useSearchForm<IDeclarationSearchParams>({
    defaultParams: DEFAULT_SEARCH_PARAMS,
  });

  const getDeclarationsQuery = useGetDeclarationsQuery({
    status:
      methods.params.status === "ALL"
        ? undefined
        : (methods.params.status as string),
    searchType: methods.params.searchType,
    searchKeyword: methods.params.searchKeyword,
    page: methods.params.page,
    size: methods.params.size,
  });

  const handleRefresh = useCallback(() => {
    getDeclarationsQuery.refetch();
  }, []);

  useEffect(() => {
    getDeclarationsQuery.refetch();
  }, [methods.searchParams]);

  return (
    <div className={cn("contents-page-content", className)}>
      <DeclarationSearchForm
        searchForm={methods}
        onSubmit={() => {
          methods.handleSubmit();
        }}
        onRefresh={() => {
          methods.handleReset();
        }}
      />
      <DeclarationTable
        data={getDeclarationsQuery.data?.content ?? []}
        totalCount={getDeclarationsQuery.data?.totalCount ?? 0}
        currentPage={methods.params.page}
        pageSize={methods.params.size}
        onRefresh={handleRefresh}
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

export default DeclarationPageContent;
