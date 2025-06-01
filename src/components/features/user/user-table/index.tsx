"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { IUser, UserType } from "@/models/user";
import UserDetailModal from "@/components/features/user/user-detail-modal";
import { useModal } from "@/components/shared/modal/useModal";
import CommonTable, {
  CommonTableProps,
} from "@/components/shared/common-table";
import CommonPagination, {
  CommonPaginationProps,
} from "@/components/shared/common-pagination";
import { formatDate } from "@/utils/date";

interface UserTableProps
  extends Omit<CommonTableProps<IUser> & CommonPaginationProps, "columns"> {
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
  const modal = useModal();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
        const userType = info.getValue() as UserType;
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
      cell: (info) => formatDate(info.getValue() as string),
    },
    {
      accessorKey: "recentLoggedInAt",
      header: "최근접속",
      cell: (info) => formatDate(info.getValue() as string),
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

  const handleClickRow = useCallback(
    (row: Row<IUser>) => {
      setSelectedUserId(row.getValue("id"));
      modal.open();
    },
    [modal],
  );

  return (
    <div className={cn("user-table-wrapper", className)} {...props}>
      <CommonTable<IUser>
        data={data || []}
        columns={columns}
        onClickRow={handleClickRow}
      />
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

export default UserTable;
