"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import CommonTable from "@/components/shared/common-table";
import { useGetUsersQuery } from "@/queries";
import { ColumnDef } from "@tanstack/react-table";
import { IUser, UserType } from "@/models/user";
import { DEFAULT_PAGE_SIZE } from "@/components/shared/common-pagination/contants";
import CommonPagination from "@/components/shared/common-pagination";

interface UserTableProps {
  className?: string;
}

function UserTable({ className, ...props }: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const getUsersQuery = useGetUsersQuery();

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
      <CommonTable data={getUsersQuery.data?.content || []} columns={columns} />
      <CommonPagination
        currentPage={currentPage}
        totalCount={getUsersQuery.data?.totalCount ?? 0}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default UserTable;
