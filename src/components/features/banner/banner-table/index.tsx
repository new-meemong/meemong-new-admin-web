"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import UserDetailModal from "@/components/features/user/user-detail-modal";
import { useModal } from "@/components/shared/modal/useModal";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { BannerLocationType, IBanner } from "@/models/banner";
import IcUpdate from "@/assets/icons/ic_update.svg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import BannerImageBox from "@/components/features/banner/banner-image-box";

interface BannerTableProps
  extends Omit<CommonTableProps<IBanner> & CommonPaginationProps, "columns"> {
  className?: string;
}

function BannerTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  onPageChange,
  ...props
}: BannerTableProps) {
  const modal = useModal();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const columns: ColumnDef<IBanner>[] = [
    {
      accessorKey: "companyName",
      header: "고객사명",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "bannerImageUrl",
      header: "이미지",
      cell: (info) => <BannerImageBox src={info.getValue()} />,
    },
    {
      accessorKey: "location",
      header: "위치",
      cell: (info) => {
        const location = info.getValue() as BannerLocationType;
        if (location === "1") {
          return "모델메인상단";
        } else {
          return "일반";
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "등록일",
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "endAt",
      header: "마감일",
      cell: (info) => formatDate(info.getValue() as string),
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
      setSelectedUserId(bannerId);
      modal.open();
    },
    [modal],
  );

  return (
    <div className={cn("banner-table-wrapper", className)} {...props}>
      <CommonTable<IBanner> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
      />
      <UserDetailModal
        userId={selectedUserId!}
        isOpen={modal.isOpen}
        onClose={() => {
          modal.close();
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}

export default BannerTable;
