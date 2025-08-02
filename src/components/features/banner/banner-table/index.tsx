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
import { IBanner } from "@/models/banner";
import IcUpdate from "@/assets/icons/ic_update.svg";
import { Button } from "@/components/ui/button";
import BannerImageBox from "@/components/features/banner/banner-image-box";
import { useDrawer } from "@/components/shared/right-drawer/useDrawer";
import BannerRightDrawer from "@/components/features/banner/banner-right-drawer";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";

interface BannerTableProps
  extends Omit<CommonTableProps<IBanner> & CommonPaginationProps, "columns"> {
  className?: string;
}

function BannerTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGINATION.size,
  onPageChange,
  onSizeChange,
  ...props
}: BannerTableProps) {
  const { openDrawer } = useDrawer();

  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);

  const columns: ColumnDef<IBanner>[] = [
    {
      accessorKey: "company",
      header: "고객사명",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "imageUrl",
      header: "이미지",
      cell: (info) => <BannerImageBox src={info.getValue() as string} />,
    },
    {
      accessorKey: "bannerType",
      header: "위치",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "endAt",
      header: "마감일",
      cell: (info) =>
        info.getValue() ? formatDate(info.getValue() as string) : "-",
    },
    {
      accessorKey: "clickCount",
      header: "클릭수",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "",
      header: "수정",
      cell: (info) => {
        const banner = info.row.original;
        return (
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => handleClickRow(banner.id)}
          >
            <IcUpdate />
          </Button>
        );
      },
    },
  ];

  const handleClickRow = useCallback(
    (bannerId: number) => {
      setSelectedBannerId(bannerId);
      openDrawer();
    },
    [openDrawer],
  );

  return (
    <div className={cn("banner-table-wrapper", className)} {...props}>
      <CommonTable<IBanner> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      <BannerRightDrawer bannerId={selectedBannerId!} />
    </div>
  );
}

export default BannerTable;
