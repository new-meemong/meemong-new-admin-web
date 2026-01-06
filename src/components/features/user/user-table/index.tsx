"use client";

import { CellContext, ColumnDef, Row } from "@tanstack/react-table";
import CommonPagination, {
  CommonPaginationProps
} from "@/components/shared/common-pagination";
import CommonTable, {
  CommonTableProps
} from "@/components/shared/common-table";
import { IUser, UserRoleType } from "@/models/users";
import React, { useCallback, useState } from "react";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import ImageTable from "@/components/shared/image-table";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { getUserRole } from "@/utils/user";
import { useDrawer } from "@/stores/drawer";
import { useUsersContext } from "@/components/contexts/users-context";

interface UserTableProps
  extends Omit<CommonTableProps<IUser> & CommonPaginationProps, "columns"> {
  className?: string;
  onRefresh: () => void;
  showPagination?: boolean;
  selectedRole?: "ALL" | "1" | "2"; // 유저타입 필터 값
}

function UserTable({
  className,
  data,
  totalCount,
  currentPage = DEFAULT_PAGINATION.page,
  pageSize = DEFAULT_PAGINATION.size,
  onPageChange,
  onSizeChange,
  onRefresh,
  showPagination = true,
  selectedRole = "ALL",
  ...props
}: UserTableProps) {
  const { isPhotoMode } = useUsersContext();
  const { openDrawer } = useDrawer();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // 디자이너가 아닌 경우 (전체 또는 모델) 휴식중/추천모델 컬럼 표시
  const showModelColumns = selectedRole !== "2";

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "id",
      header: "No",
      cell: (info) => {
        const role = info.row.original.role;

        let cellValue = info.getValue() as string;

        if (getUserRole(role) === "MODEL") {
          cellValue = `M-${cellValue}`;
        } else if (getUserRole(role) === "DESIGNER") {
          cellValue = `D-${cellValue}`;
        }

        return cellValue;
      },
      size: 80,
      enableSorting: false
    },
    {
      accessorKey: "displayName",
      header: "닉네임",
      cell: (info) => (
        <span
          className={cn(
            "cursor-pointer text-secondary-foreground hover:underline"
          )}
        >
          {info.getValue() as string}
        </span>
      ),
      enableSorting: false
    },
    {
      accessorKey: "role",
      header: "유저타입",
      cell: (info) => {
        const role = info.getValue() as UserRoleType;
        if (getUserRole(role) === "MODEL") {
          return "모델";
        } else if (getUserRole(role) === "DESIGNER") {
          return "디자이너";
        } else {
          return "-";
        }
      },
      size: 120,
      enableSorting: false
    },
    {
      accessorKey: "createdAt",
      header: "가입일",
      cell: (info) =>
        formatDate(info.getValue() as string, "YYYY.MM.DD HH:mm") || "-",
      size: 160,
      enableSorting: true
    },
    {
      accessorKey: "recentLoginTime",
      header: "접속시간(앱정렬)",
      cell: (info) => {
        const value = info.getValue() as string | null;
        return value ? formatDate(value, "YYYY.MM.DD HH:mm:ss") || "-" : "-";
      },
      size: 180,
      enableSorting: true
    },
    {
      accessorKey: "recentRealLoginTime",
      header: "접속시간(실제)",
      cell: (info) => {
        const value = info.getValue() as string | null;
        return value ? formatDate(value, "YYYY.MM.DD HH:mm:ss") || "-" : "-";
      },
      size: 180,
      enableSorting: true
    },
    ...(showModelColumns
      ? [
          {
            accessorKey: "isBreakTime",
            header: "휴식중",
            cell: (info: CellContext<IUser, boolean>) => {
              const isBreakTime = info.getValue();
              return isBreakTime ? (
                <span className={cn("text-primary")}>휴식중</span>
              ) : (
                "-"
              );
            },
            size: 100,
            enableSorting: false
          } as ColumnDef<IUser>,
          {
            accessorKey: "isRecommended",
            header: "추천모델",
            cell: (info: CellContext<IUser, boolean>) => {
              const isRecommended = info.getValue();
              return isRecommended ? (
                <span className={cn("text-primary")}>추천</span>
              ) : (
                "-"
              );
            },
            size: 100,
            enableSorting: false
          } as ColumnDef<IUser>
        ]
      : []),
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
      enableSorting: false
    },
    {
      accessorKey: "isBlocked",
      header: "차단",
      cell: (info) => {
        const isBlocked =
          info.row.original.role === 3 || info.row.original.role === 4;

        if (isBlocked) {
          return <span className={cn("text-negative")}>차단</span>;
        } else {
          return "-";
        }
      },
      size: 80,
      enableSorting: false
    }
  ];

  const handleClickRow = useCallback((row: Row<IUser>) => {
    setSelectedUserId(row.original?.id);
    openDrawer();
  }, []);

  return (
    <div className={cn("user-table-wrapper", className)} {...props}>
      {isPhotoMode ? (
        <ImageTable
          data={data || []}
          columns={columns}
          renderItem={(row) => {
            const user = row.original;
            const isDesigner = getUserRole(user.role) === "DESIGNER";
            const isModel = getUserRole(user.role) === "MODEL";

            return (
              <div
                className={cn(
                  "w-full h-full relative flex cursor-pointer items-center justify-center"
                )}
              >
                {user.profilePictureURL ? (
                  <img
                    src={user.profilePictureURL}
                    alt={user.displayName}
                    className={cn("w-full h-full object-cover aspect-square")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted aspect-square">
                    {user.displayName}
                  </div>
                )}

                {/* 왼쪽 상단: 전체일 때만 모델/디자이너 구분 */}
                {selectedRole === "ALL" && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isModel && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                        )}
                      >
                        모델
                      </span>
                    )}
                    {isDesigner && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                        )}
                      >
                        디자이너
                      </span>
                    )}
                  </div>
                )}

                {/* 오른쪽 상단: 디자이너가 아닐 때만 휴식중/추천모델 */}
                {!isDesigner && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {user.isBreakTime && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                        )}
                      >
                        휴식중
                      </span>
                    )}
                    {user.isRecommended && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-md bg-white text-black font-bold"
                        )}
                      >
                        추천모델
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }}
          onClickRow={handleClickRow}
        />
      ) : (
        <CommonTable<IUser>
          data={data || []}
          columns={columns}
          onClickRow={handleClickRow}
        />
      )}
      {showPagination && (
        <CommonPagination
          currentPage={currentPage || 1}
          pageSize={pageSize}
          totalCount={totalCount ?? 0}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
        />
      )}
      <UserRightDrawer userId={selectedUserId!} onRefresh={onRefresh} />
    </div>
  );
}

export default UserTable;
