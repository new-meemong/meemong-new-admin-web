"use client";

import React, { useMemo } from "react";

import BrandSearchForm from "@/components/features/brand/brand-search-form";
import BrandTable from "@/components/features/brand/brand-table";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { cn } from "@/lib/utils";
import { useGetBrandsQuery } from "@/queries/brands";
import useSearchMethods from "@/components/shared/search-form/useSearchMethods";

interface BrandPageContentProps {
  className?: string;
}

function BrandPageContent({ className }: BrandPageContentProps) {
  const defaultParams = useMemo(
    () => ({
      ...DEFAULT_PAGINATION,
    }),
    []
  );

  const methods = useSearchMethods({
    defaultParams,
  });

  const page = methods.params.page as number | undefined;
  const size = methods.params.size as number | undefined;

  const getBrandsQuery = useGetBrandsQuery(
    {
      page,
      size,
    },
    {
      enabled: true,
    }
  );

  return (
    <div className={cn("brand-page-content", className)}>
      <BrandSearchForm
        onRefresh={() => {
          getBrandsQuery.refetch();
        }}
      />
      <BrandTable
        data={getBrandsQuery.data?.content ?? []}
        totalCount={getBrandsQuery.data?.totalCount ?? 0}
        currentPage={page ?? 1}
        pageSize={size ?? DEFAULT_PAGINATION.size}
        onRefresh={() => {
          getBrandsQuery.refetch();
        }}
        onPageChange={(page) => {
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

export default BrandPageContent;


