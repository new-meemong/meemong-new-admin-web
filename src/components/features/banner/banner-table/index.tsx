"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import CommonTable, {
  CommonTableProps
} from "@/components/shared/common-table";
import React, { useCallback, useState } from "react";

import BannerFormModal from "@/components/features/banner/banner-form-modal";
import BannerImageBox from "@/components/features/banner/banner-image-box";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IBanner } from "@/models/banner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { useModal } from "@/components/shared/modal/useModal";

interface BannerTableProps
  extends Omit<CommonTableProps<IBanner> & CommonPaginationProps, "columns"> {
  onRefresh: () => void;
  className?: string;
}

function BannerTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGINATION.size,
  onRefresh,
  onPageChange,
  onSizeChange,
  ...props
}: BannerTableProps) {
  const modal = useModal();

  const [selectedBanner, setSelectedBanner] = useState<IBanner | undefined>(
    undefined
  );

  const columns: ColumnDef<IBanner>[] = [
    {
      accessorKey: "company",
      header: "고객사명",
      cell: (info) => info.getValue() || "-",
      enableSorting: false
    },
    {
      accessorKey: "imageUrl",
      header: "이미지",
      cell: (info) => <BannerImageBox src={info.getValue() as string} />,
      enableSorting: false
    },
    {
      accessorKey: "bannerType",
      header: "위치",
      cell: (info) => {
        const bannerTypeItem: string[] = [];
        if (info.row.original.userType) {
          bannerTypeItem.push(info.row.original.userType);
        }
        if (info.getValue()) {
          bannerTypeItem.push(info.getValue() as string);
        }

        return bannerTypeItem.join(" ") || "-";
      },
      enableSorting: false
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string)
    },
    {
      accessorKey: "clickCount",
      header: "클릭수",
      cell: (info) => info.getValue(),
      enableSorting: false
    },
    {
      accessorKey: "redirectUrl",
      header: "링크",
      cell: (info) => info.getValue(),
      enableSorting: false
    }
  ];

  const handleClickRow = useCallback(
    (row: Row<IBanner>) => {
      setSelectedBanner(row.original);
      modal.open();
    },
    [modal]
  );

  return (
    <div className={cn("banner-table-wrapper", className)} {...props}>
      <CommonTable<IBanner>
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
      <BannerFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        banner={selectedBanner}
        onSubmit={() => {
          onRefresh();
        }}
      />
    </div>
  );
}

export default BannerTable;
