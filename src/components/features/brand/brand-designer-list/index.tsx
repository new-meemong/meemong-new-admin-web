"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CommonTable from "@/components/shared/common-table";
import CommonPagination from "@/components/shared/common-pagination";
import { Button } from "@/components/ui/button";
import { IUser } from "@/models/users";
import { useGetUsersQuery } from "@/queries/users";
import { keepPreviousData } from "@tanstack/react-query";
import { USER_LIST_ROLE } from "@/constants/users";

const columns: ColumnDef<IUser>[] = [
  { accessorKey: "id", header: "회원 ID", enableSorting: false },
  { accessorKey: "displayName", header: "닉네임", enableSorting: false },
  {
    id: "status",
    header: "상태",
    cell: ({ row }) =>
      row.original.isWithdraw
        ? "탈퇴"
        : row.original.isBlocked
          ? "차단"
          : "정상",
    enableSorting: false,
  },
];

export default function BrandDesignerList({
  brandId,
  onSelectDesigner,
}: {
  brandId: number;
  onSelectDesigner?: (userId: number) => void;
}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const query = useGetUsersQuery(
    { role: USER_LIST_ROLE.DESIGNER, brandId, page, size },
    { placeholderData: keepPreviousData },
  );

  return (
    <section
      className="space-y-3 border-t pt-4"
      aria-label="브랜드 디자이너"
      aria-busy={query.isFetching}
    >
      <h3 className="font-semibold">
        브랜드 디자이너
        {query.isSuccess && ` (${query.data.totalCount.toLocaleString()}명)`}
      </h3>
      {query.isError ? (
        <div role="alert" className="flex items-center gap-3">
          디자이너 목록을 불러오지 못했습니다.
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            다시 시도
          </Button>
        </div>
      ) : query.isPending ? (
        <p role="status">디자이너 목록을 불러오는 중...</p>
      ) : (
        <>
          <CommonTable
            data={query.data.content}
            columns={columns}
            onClickRow={
              onSelectDesigner && !query.isPlaceholderData
                ? (row) => onSelectDesigner(row.original.id)
                : undefined
            }
            emptyMessage="등록된 디자이너가 없습니다."
          />
          <CommonPagination
            currentPage={page}
            pageSize={size}
            totalCount={query.data.totalCount}
            canChangePage={() => !query.isPlaceholderData}
            onPageChange={setPage}
            onSizeChange={(nextSize) => {
              setSize(nextSize);
              setPage(1);
            }}
          />
        </>
      )}
    </section>
  );
}
