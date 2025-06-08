"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { IUser, UserType } from "@/models/user";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import { useDrawer } from "@/components/shared/right-drawer/useDrawer";

interface UserTableProps
  extends Omit<CommonTableProps<IUser> & CommonPaginationProps, "columns"> {
  className?: string;
}

function UserTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onSizeChange,
  ...props
}: UserTableProps) {
  const { openDrawer } = useDrawer();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "id",
      header: "No",
      cell: (info) => {
        const userType = info.row.original.userType;

        let cellValue = info.getValue() as string;

        if (userType === "MODEL") {
          cellValue = `M-${cellValue}`;
        } else if (userType === "DESIGNER") {
          cellValue = `D-${cellValue}`;
        }

        return cellValue;
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: "nickname",
      header: "닉네임",
      cell: (info) => (
        <span
          className={cn(
            "cursor-pointer text-secondary-foreground hover:underline",
          )}
        >
          {info.getValue()}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "userType",
      header: "유저타입",
      cell: (info) => {
        const userType = info.getValue() as UserType;
        if (userType === "MODEL") {
          return "모델";
        } else if (userType === "DESIGNER") {
          return "디자이너";
        } else {
          return "-";
        }
      },
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "가입일",
      cell: (info) => formatDate(info.getValue() as string, "YYYY.MM.DD"),
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: "recentLoggedInAt",
      header: "최근접속",
      cell: (info) => formatDate(info.getValue() as string, "YYYY.MM.DD"),
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: "isWithdraw",
      header: "탈퇴여부",
      cell: (info) => {
        const isWithdraw = info.getValue();
        if (isWithdraw) {
          return <span className={cn("text-cautionary")}>탈퇴</span>;
        } else {
          return "-";
        }
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: "isBlocked",
      header: "차단",
      cell: (info) => {
        const isBlocked = info.getValue();
        if (isBlocked) {
          return <span className={cn("text-nagative")}>차단</span>;
        } else {
          return "-";
        }
      },
      size: 80,
      enableSorting: false,
    },
  ];

  const handleClickRow = useCallback((row: Row<IUser>) => {
    setSelectedUserId(row.getValue("id"));
    openDrawer();
  }, []);

  return (
    <div className={cn("user-table-wrapper", className)} {...props}>
      <CommonTable<IUser>
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
      <UserRightDrawer userId={selectedUserId!} />
    </div>
  );
}

export default UserTable;
