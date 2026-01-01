"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import CommonTable, {
  CommonTableProps
} from "@/components/shared/common-table";
import React, { useCallback, useState } from "react";

import BrandEditModal from "@/components/features/brand/brand-edit-modal";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IBrand } from "@/models/brand";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { useModal } from "@/components/shared/modal/useModal";

interface BrandTableProps
  extends Omit<CommonTableProps<IBrand> & CommonPaginationProps, "columns"> {
  onRefresh: () => void;
  className?: string;
}

function BrandTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGINATION.size,
  onRefresh,
  onPageChange,
  onSizeChange,
  ...props
}: BrandTableProps) {
  const modal = useModal();

  const [selectedBrand, setSelectedBrand] = useState<IBrand | undefined>(
    undefined
  );

  const columns: ColumnDef<IBrand>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "code",
      header: "코드",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "브랜드명",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string),
    },
  ];

  const handleClickRow = useCallback(
    (row: Row<IBrand>) => {
      setSelectedBrand(row.original);
      modal.open();
    },
    [modal]
  );

  return (
    <div className={cn("brand-table-wrapper", className)} {...props}>
      <CommonTable<IBrand>
        data={data || []}
        columns={columns}
        onClickRow={handleClickRow}
      />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      {selectedBrand && (
        <BrandEditModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          brand={selectedBrand}
          onSubmit={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

export default BrandTable;


