"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { IUser, UserType } from "@/models/user";
import SearchTable, {
  SearchTableProps,
} from "@/components/shared/search-table";

interface UserTableProps extends SearchTableProps<IUser> {
  className?: string;
}

function UserTable({
  className,
  data,
  totalCount,
  currentPage = 1,
  onPageChange,
  ...props
}: UserTableProps) {
  const columns: ColumnDef<IUser>[] = [
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
    {
      accessorKey: "userType",
      header: "유저타입",
      cell: (info) => {
        const userType: UserType = info.getValue();
        if (userType === "1") {
          return "모델";
        } else if (userType === "2") {
          return "디자이너";
        } else {
          return "-";
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: "가입일",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "recentLoggedIndAt",
      header: "최근접속",
      cell: (info) => info.getValue(),
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
    },
  ];

  return (
    <div className={cn("user-table-wrapper", className)} {...props}>
      <SearchTable<IUser>
        data={data}
        columns={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default UserTable;
