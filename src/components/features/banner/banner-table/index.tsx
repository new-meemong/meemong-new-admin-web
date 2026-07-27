"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import CommonTable, {
  CommonTableProps
} from "@/components/shared/common-table";
import React, { useCallback, useState } from "react";

import BannerEditModal from "@/components/features/banner/banner-edit-modal";
import BannerImageBox from "@/components/features/banner/banner-image-box";
import BannerStatusBadge from "@/components/features/banner/banner-status-badge";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IBanner } from "@/models/banner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { useModal } from "@/components/shared/modal/useModal";
import type { BannerStatus } from "@/utils/banner";

interface BannerTableProps
  extends Omit<CommonTableProps<IBanner> & CommonPaginationProps, "columns"> {
  onRefresh: () => void;
  bannerStatusesById: ReadonlyMap<number, BannerStatus>;
  className?: string;
}

function BannerTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGINATION.size,
  onRefresh,
  bannerStatusesById,
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
      accessorKey: "id",
      header: "배너 ID",
      cell: (info) => info.getValue(),
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
      accessorKey: "redirectUrl",
      header: "링크",
      cell: (info) => info.getValue(),
      enableSorting: false
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string)
    },
    {
      accessorKey: "endAt",
      header: "종료일",
      cell: (info) => {
        const endAt = info.getValue() as string | undefined;
        return endAt ? formatDate(endAt) : "-";
      },
      enableSorting: false
    },
    {
      id: "status",
      header: "상태",
      cell: (info) => {
        const status =
          bannerStatusesById.get(info.row.original.id) ?? "비활성화";
        return <BannerStatusBadge status={status} />;
      },
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
      {selectedBanner && (
        <BannerEditModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          banner={selectedBanner}
          onSubmit={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

export default BannerTable;
