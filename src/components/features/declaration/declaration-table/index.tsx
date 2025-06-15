"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { IDeclaration } from "@/models/declaration";
import { DeclarationStatusType } from "@/constants/declaration";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { useModal } from "@/components/shared/modal/useModal";
import DeclarationDetailModal from "@/components/features/declaration/declaration-detail-modal";

interface DeclarationTableProps
  extends Omit<
    CommonTableProps<IDeclaration> & CommonPaginationProps,
    "columns"
  > {
  className?: string;
}

function DeclarationTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onSizeChange,
  ...props
}: DeclarationTableProps) {
  const modal = useModal();

  const [selectedDeclaration, setSelectedDeclaration] =
    useState<IDeclaration | null>(null);

  const columns: ColumnDef<IDeclaration>[] = [
    {
      accessorKey: "id",
      header: "No",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: "reporter",
      header: "신고자",
      cell: (info) => (
        <span
          className={cn(
            "cursor-pointer text-secondary-foreground hover:underline",
          )}
          onClick={() => handleClickRow(info.row.original)}
        >
          {info.getValue() as string}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "respondent",
      header: "피신고자",
      cell: (info) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "처리상태",
      cell: (info) => {
        const status = info.getValue() as DeclarationStatusType;
        if (status === "0") {
          return "미확인";
        } else if (status === "1") {
          return "확인";
        } else if (status === "2") {
          return "대기";
        } else if (status === "3") {
          return "처리완료";
        } else {
          return "-";
        }
      },
      enableSorting: false,
    },
    {
      accessorKey: "declarationAt",
      header: "신고일자",
      cell: (info) => formatDate(info.getValue() as string),
      enableSorting: true,
    },
    {
      accessorKey: "reactAt",
      header: "처리일자",
      cell: (info) => {
        return info.getValue() ? formatDate(info.getValue() as string) : "-";
      },
      enableSorting: true,
    },
  ];

  const handleClickRow = useCallback((declaration: IDeclaration) => {
    setSelectedDeclaration(declaration);
    modal.open();
  }, []);

  return (
    <div className={cn("declaration-table-wrapper", className)} {...props}>
      <CommonTable<IDeclaration> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      <DeclarationDetailModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        declaration={selectedDeclaration!}
      />
    </div>
  );
}

export default DeclarationTable;
