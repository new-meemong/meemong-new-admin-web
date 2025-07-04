"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { IUser, UserRoleType } from "@/models/users";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { useDrawer } from "@/components/shared/right-drawer/useDrawer";

interface UserTableProps
  extends Omit<CommonTableProps<IUser> & CommonPaginationProps, "columns"> {
  className?: string;
}

function UserTable({
  className,
  data,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = DEFAULT_PAGINATION.size,
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
        const role = info.row.original.role;

        let cellValue = info.getValue() as string;

        if (role === 1) {
          cellValue = `M-${cellValue}`;
        } else if (role === 2) {
          cellValue = `D-${cellValue}`;
        }

        return cellValue;
      },
      size: 80,
      enableSorting: false,
    },
    {
      accessorKey: "displayName",
      header: "닉네임",
      cell: (info) => (
        <span
          className={cn(
            "cursor-pointer text-secondary-foreground hover:underline",
          )}
          onClick={() => handleClickRow(info.row.original.id)}
        >
          {info.getValue() as string}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "role",
      header: "유저타입",
      cell: (info) => {
        const role = info.getValue() as UserRoleType;
        if (role === 1) {
          return "모델";
        } else if (role === 2) {
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
      cell: (info) =>
        formatDate(info.getValue() as string, "YYYY.MM.DD") || "-",
      size: 120,
      enableSorting: true,
    },
    {
      accessorKey: "recentLoginTime",
      header: "최근접속",
      cell: (info) =>
        formatDate(info.getValue() as string, "YYYY.MM.DD") || "-",
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

  const handleClickRow = useCallback((userId: number) => {
    setSelectedUserId(userId);
    openDrawer();
  }, []);

  return (
    <div className={cn("user-table-wrapper", className)} {...props}>
      <CommonTable<IUser> data={data || []} columns={columns} />
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
