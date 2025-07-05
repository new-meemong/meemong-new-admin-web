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
import {
  ContentsCategoryType,
  CostType,
  IContents,
  RecruitmentType,
} from "@/models/contents";
import { UserRoleType } from "@/models/users";
import { useContentsContext } from "@/components/contexts/contents-context";
import { useModal } from "@/components/shared/modal/useModal";
import ContentsDetailModal from "@/components/features/contents/contents-detail-modal";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { ResumeRoleType } from "@/models/resumes";

interface ContentsTableProps
  extends Omit<CommonTableProps<IContents> & CommonPaginationProps, "columns"> {
  className?: string;
}

function ContentsTable({
  className,
  data,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = DEFAULT_PAGINATION.size,
  onPageChange,
  onSizeChange,
  ...props
}: ContentsTableProps) {
  const modal = useModal();

  const { tabId } = useContentsContext();

  const [selectedContents, setSelectedContents] = useState<IContents | null>(
    null,
  );

  const getColumnsByCategory = (
    category: ContentsCategoryType,
  ): ColumnDef<IContents>[] => {
    const baseColumns: ColumnDef<IContents>[] = [
      {
        accessorKey: "id",
        header: "No",
        cell: (info) => info.getValue(),
        size: 80,
        enableSorting: false,
      },
      {
        accessorKey: "userInfo.displayName",
        header: "닉네임",
        cell: (info) => info.getValue() || "-",
        size: 180,
        enableSorting: false,
      },
    ];

    switch (category) {
      case "0":
        return [
          ...baseColumns,
          {
            accessorKey: "userInfo.role",
            header: "작성자타입",
            cell: (info) => {
              const role = info.getValue() as UserRoleType;
              return role === 1 ? "모델" : role === 2 ? "디자이너" : "-";
            },
            size: 120,
            enableSorting: false,
          },
          {
            accessorKey: "title",
            header: "제목",
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
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) =>
              formatDate(info.getValue() as string, "YYYY.MM.DD / hh:mm"),
            size: 150,
            enableSorting: true,
          },
          {
            accessorKey: "deletedAt",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
            size: 80,
            enableSorting: false,
          },
        ];
      case "1":
        return [
          ...getColumnsByCategory("0"),
          {
            accessorKey: "isApproved",
            header: "승인여부",
            cell: (info) =>
              info.getValue() !== undefined ? (
                info.getValue() ? (
                  <span>승인</span>
                ) : (
                  <span className={"text-nagative"}>승인불가</span>
                )
              ) : (
                "-"
              ),
            size: 80,
            enableSorting: false,
          },
        ];
      case "2":
        return [
          ...baseColumns,
          {
            accessorKey: "storeName",
            header: "업체명",
            cell: (info) => info.getValue() || "-",
            size: 180,
            enableSorting: false,
          },
          {
            accessorKey: "postingTitle",
            header: "제목",
            cell: (info) => (
              <span
                className={cn(
                  "cursor-pointer text-secondary-foreground hover:underline",
                )}
                onClick={() => handleClickRow(info.row.original)}
              >
                {(info.getValue() as string) || "-"}
              </span>
            ),
            enableSorting: false,
          },
          {
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) =>
              formatDate(info.getValue() as string, "YYYY.MM.DD / hh:mm") ||
              "-",
            size: 150,
            enableSorting: true,
          },
          {
            accessorKey: "deletedAt",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
            size: 80,
            enableSorting: false,
          },
        ];
      case "3":
        return [
          ...baseColumns,
          {
            accessorKey: "appliedRole",
            header: "구직타입",
            cell: (info) => {
              return (info.getValue() as ResumeRoleType) || "-";
            },
            size: 120,
            enableSorting: false,
          },
          {
            accessorKey: "shortDescription",
            header: "제목",
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
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) =>
              formatDate(info.getValue() as string, "YYYY.MM.DD / hh:mm"),
            size: 150,
            enableSorting: true,
          },
          {
            accessorKey: "deletedAt",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
            size: 80,
            enableSorting: false,
          },
        ];
      case "4":
        return [
          ...baseColumns,
          {
            accessorKey: "recruitment",
            header: "모집타입",
            cell: (info) => {
              const map: Record<RecruitmentType, string> = {
                "0": "펌",
                "1": "탈색",
                "2": "메이크업",
                "3": "속눈썹",
                "4": "커트",
                "5": "염색",
                "6": "클리닉",
                "7": "매직",
                "8": "드라이",
                "9": "붙임머리",
              };
              return map[info.getValue() as RecruitmentType] || "-";
            },
            size: 120,
            enableSorting: false,
          },
          {
            accessorKey: "costType",
            header: "비용타입",
            cell: (info) => {
              const map: Record<CostType, string> = {
                "0": "무료",
                "1": "재료비",
                "2": "모델료",
              };
              return map[info.getValue() as CostType] || "-";
            },
            size: 120,
            enableSorting: false,
          },
          {
            accessorKey: "title",
            header: "제목",
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
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) =>
              formatDate(info.getValue() as string, "YYYY.MM.DD / hh:mm"),
            size: 150,
            enableSorting: true,
          },
        ];
      default:
        return baseColumns;
    }
  };

  const columns = getColumnsByCategory(tabId as ContentsCategoryType);

  const handleClickRow = useCallback((selectedContents: IContents) => {
    setSelectedContents(selectedContents);
    modal.open();
  }, []);

  return (
    <div className={cn("contents-table-wrapper", className)} {...props}>
      <CommonTable<IContents> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        pageSize={pageSize}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
      <ContentsDetailModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        contents={selectedContents!}
        categoryId={tabId as ContentsCategoryType}
      />
    </div>
  );
}

export default ContentsTable;
