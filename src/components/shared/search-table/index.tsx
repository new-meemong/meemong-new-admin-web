"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import CommonTable from "@/components/shared/search-table/common-table";
import { ColumnDef } from "@tanstack/react-table";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/search-table/common-pagination/contants";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/search-table/common-pagination";

export interface SearchTableProps<TData> extends CommonPaginationProps {
  className?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
}

function SearchTable<TData>({
  className,
  columns,
  data,
  totalCount,
  pageSize,
  currentPage = 1,
  onPageChange,
  ...props
}: SearchTableProps<TData>) {
  return (
    <div className={cn("search-table", className)} {...props}>
      <CommonTable data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        totalCount={totalCount ?? 0}
        pageSize={pageSize ?? DEFAULT_PAGE_SIZE}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default SearchTable;
