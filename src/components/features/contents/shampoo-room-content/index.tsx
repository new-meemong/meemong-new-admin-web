"use client";

import React, { useCallback, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import CommonPagination from "@/components/shared/common-pagination";
import CommonTable from "@/components/shared/common-table";
import { useModal } from "@/components/shared/modal/useModal";
import { useGetShampooRoomsQuery } from "@/queries/shampooRooms";
import { IShampooRoom, ShampooRoomCategory } from "@/models/shampooRooms";
import ShampooRoomDetailModal from "@/components/features/contents/contents-detail-modal/shampoo-room-detail-modal";
import {
  SearchForm,
  SearchFormSelectBox,
} from "@/components/shared/search-form";
import { GetShampooRoomsRequest } from "@/apis/shampooRooms";
import useContentsCursorPagination from "@/components/features/contents/hooks/useContentsCursorPagination";

type ShampooRoomSearchParams = {
  category: string;
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "FREE", label: "자유" },
  { value: "EDUCATION", label: "교육" },
  { value: "PRODUCT", label: "제품" },
  { value: "MARKET", label: "마켓" },
];

const COLUMNS: ColumnDef<IShampooRoom>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "user.name",
    header: "작성자",
    cell: (info) => info.getValue() || "-",
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "카테고리",
    cell: (info) => info.getValue() || "-",
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
      >
        {info.getValue() as string}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "viewCount",
    header: "조회수",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "commentCount",
    header: "댓글",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "작성일/시간",
    cell: (info) => formatDate(info.getValue() as string, "YYYY.MM.DD / HH:mm"),
    size: 160,
    enableSorting: true,
  },
];

interface ShampooRoomContentProps {
  className?: string;
}

export default function ShampooRoomContent({
  className,
}: ShampooRoomContentProps) {
  const modal = useModal();
  const [selectedShampooRoom, setSelectedShampooRoom] =
    useState<IShampooRoom | null>(null);
  const [category, setCategory] = useState<string>("ALL");
  const [searchCategory, setSearchCategory] = useState<string>("ALL");

  const buildShampooRoomsRequest = useCallback(
    (cursor: string | undefined, pageSize: number): GetShampooRoomsRequest => ({
      __nextCursor: cursor,
      __limit: pageSize,
      category:
        searchCategory === "ALL"
          ? undefined
          : (searchCategory as ShampooRoomCategory),
    }),
    [searchCategory],
  );

  const {
    currentCursor,
    currentPage,
    pageSize,
    resetPagination,
    handlePageChange,
    handleSizeChange,
    getReachableTotalCount,
  } = useContentsCursorPagination();

  const getShampooRoomsQuery = useGetShampooRoomsQuery(
    buildShampooRoomsRequest(currentCursor, pageSize),
  );

  const dataList = getShampooRoomsQuery.data?.dataList ?? [];
  const nextCursor = getShampooRoomsQuery.data?.__nextCursor ?? null;

  const handleSearch = useCallback(() => {
    setSearchCategory(category);
    resetPagination();
  }, [category, resetPagination]);

  const handleReset = useCallback(() => {
    setCategory("ALL");
    setSearchCategory("ALL");
    resetPagination();
  }, [resetPagination]);

  const handleClickRow = useCallback(
    (row: Row<IShampooRoom>) => {
      setSelectedShampooRoom(row.original);
      modal.open();
    },
    [modal],
  );

  const handleClose = useCallback(() => {
    modal.close();
    setSelectedShampooRoom(null);
  }, [modal]);

  return (
    <div className={cn("shampoo-room-content flex flex-col gap-4", className)}>
      <SearchForm onSubmit={handleSearch} onRefresh={handleReset}>
        <SearchFormSelectBox<ShampooRoomSearchParams>
          name="category"
          className={cn("w-[130px]")}
          value={category}
          onChange={({ value }) => setCategory(value)}
          options={CATEGORY_OPTIONS}
          title="카테고리"
        />
      </SearchForm>

      <CommonTable<IShampooRoom>
        data={dataList}
        columns={COLUMNS}
        onClickRow={handleClickRow}
      />

      <CommonPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={getReachableTotalCount(getShampooRoomsQuery.data)}
        onPageChange={(page) => {
          handlePageChange(page, nextCursor);
        }}
        onSizeChange={handleSizeChange}
      />

      {selectedShampooRoom && (
        <ShampooRoomDetailModal
          isOpen={modal.isOpen}
          onClose={handleClose}
          shampooRoom={selectedShampooRoom}
          onRefresh={() => getShampooRoomsQuery.refetch()}
        />
      )}
    </div>
  );
}
