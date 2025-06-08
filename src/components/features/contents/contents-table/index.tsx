"use client";

import React from "react";
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
  JobCategoryType,
  RecruitmentType,
} from "@/models/contents";
import { UserType } from "@/models/user";

interface ContentsTableProps
  extends Omit<CommonTableProps<IContents> & CommonPaginationProps, "columns"> {
  className?: string;
  categoryId: ContentsCategoryType;
}

function ContentsTable({
  className,
  categoryId,
  data,
  totalCount,
  currentPage = 1,
  onPageChange,
  onSizeChange,
  ...props
}: ContentsTableProps) {
  const getColumnsByCategory = (
    category: ContentsCategoryType,
  ): ColumnDef<IContents>[] => {
    const baseColumns: ColumnDef<IContents>[] = [
      {
        accessorKey: "id",
        header: "No",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "nickname",
        header: "닉네임",
        cell: (info) => info.getValue(),
      },
    ];

    switch (category) {
      case "0":
        return [
          ...baseColumns,
          {
            accessorKey: "userType",
            header: "작성자타입",
            cell: (info) => {
              const userType = info.getValue() as UserType;
              return userType === "MODEL"
                ? "모델"
                : userType === "DESIGNER"
                  ? "디자이너"
                  : "-";
            },
          },
          {
            accessorKey: "title",
            header: "제목",
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) => formatDate(info.getValue() as string, 'YYYY.MM.DD / hh:mm'),
          },
          {
            accessorKey: "isDeleted",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
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
          },
        ];
      case "2":
        return [
          ...baseColumns,
          {
            accessorKey: "company",
            header: "업체명",
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "title",
            header: "제목",
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) => formatDate(info.getValue() as string, 'YYYY.MM.DD / hh:mm'),
          },
          {
            accessorKey: "isDeleted",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
          },
        ];
      case "3":
        return [
          ...baseColumns,
          {
            accessorKey: "jobCategory",
            header: "구직타입",
            cell: (info) => {
              const val = info.getValue() as JobCategoryType;
              return val === "0" ? "인턴" : val === "1" ? "디자이너" : "-";
            },
          },
          {
            accessorKey: "title",
            header: "제목",
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) => formatDate(info.getValue() as string, 'YYYY.MM.DD / hh:mm'),
          },
          {
            accessorKey: "isDeleted",
            header: "삭제여부",
            cell: (info) => (info.getValue() ? <span>삭제</span> : "-"),
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
          },
          {
            accessorKey: "title",
            header: "제목",
            cell: (info) => info.getValue(),
          },
          {
            accessorKey: "createdAt",
            header: "작성일/시간",
            cell: (info) => formatDate(info.getValue() as string, 'YYYY.MM.DD / hh:mm'),
          },
        ];
      default:
        return baseColumns;
    }
  };

  const columns = getColumnsByCategory(categoryId);

  return (
    <div className={cn("contents-table-wrapper", className)} {...props}>
      <CommonTable<IContents> data={data || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage || 1}
        totalCount={totalCount ?? 0}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
    </div>
  );
}

export default ContentsTable;
