"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import CommonTable, {
  CommonTableProps
} from "@/components/shared/common-table";
import React, { useCallback, useMemo, useState } from "react";

import BannerEditModal from "@/components/features/banner/banner-edit-modal";
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

  // 카테고리별 종료되지 않은 최신 배너 찾기 (userType + bannerType 조합)
  const latestActiveBannerByCategory = useMemo(() => {
    const categoryMap = new Map<string, IBanner>();
    const banners = data || [];
    const now = new Date().getTime();

    banners.forEach((banner) => {
      // 종료일이 지난 배너는 제외
      if (banner.endAt) {
        const endDate = new Date(banner.endAt).getTime();
        if (endDate < now) {
          return; // 종료된 배너는 건너뜀
        }
      }

      const category = `${banner.userType}_${banner.bannerType}`;
      const existing = categoryMap.get(category);

      if (!existing) {
        categoryMap.set(category, banner);
      } else {
        // createdAt 기준으로 더 최신 배너 선택
        const existingDate = new Date(existing.createdAt).getTime();
        const currentDate = new Date(banner.createdAt).getTime();
        if (currentDate > existingDate) {
          categoryMap.set(category, banner);
        }
      }
    });

    return categoryMap;
  }, [data]);

  // 배너 상태 계산 함수
  const getBannerStatus = useCallback(
    (banner: IBanner): "종료됨" | "비활성화" | "활성화" => {
      const now = new Date().getTime();

      // 1. 종료일이 지났으면 "종료됨"
      if (banner.endAt) {
        const endDate = new Date(banner.endAt).getTime();
        if (endDate < now) {
          return "종료됨";
        }
      }

      // 2. 같은 카테고리의 종료되지 않은 최신 배너 확인
      const category = `${banner.userType}_${banner.bannerType}`;
      const latestActiveBanner = latestActiveBannerByCategory.get(category);

      // 종료되지 않은 최신 배너가 없거나, 자신이 종료되지 않은 최신 배너면 "활성화"
      if (!latestActiveBanner || latestActiveBanner.id === banner.id) {
        return "활성화";
      }

      // 같은 카테고리에 종료되지 않은 더 최신 배너가 있으면 "비활성화"
      return "비활성화";
    },
    [latestActiveBannerByCategory]
  );

  const columns: ColumnDef<IBanner>[] = [
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
        const status = getBannerStatus(info.row.original);
        const statusStyles = {
          활성화: "bg-green-500 text-white",
          비활성화: "bg-gray-500 text-white",
          종료됨: "bg-gray-300 text-white"
        };
        return (
          <span
            className={cn(
              "inline-flex items-center justify-center px-2 py-1 rounded-md text-sm font-medium",
              statusStyles[status]
            )}
          >
            {status}
          </span>
        );
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
