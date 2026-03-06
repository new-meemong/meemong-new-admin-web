"use client";

import React, { useCallback, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import CommonTable from "@/components/shared/common-table";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/shared/modal/useModal";
import { useGetShampooRoomsQuery } from "@/queries/shampooRooms";
import { IShampooRoom, ShampooRoomCategory } from "@/models/shampooRooms";
import ShampooRoomDetailModal from "@/components/features/contents/contents-detail-modal/shampoo-room-detail-modal";
import {
  SearchForm,
  SearchFormSelectBox
} from "@/components/shared/search-form";

type ShampooRoomSearchParams = {
  category: string;
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "FREE", label: "자유" },
  { value: "EDUCATION", label: "교육" },
  { value: "PRODUCT", label: "제품" },
  { value: "MARKET", label: "마켓" }
];

const COLUMNS: ColumnDef<IShampooRoom>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false
  },
  {
    accessorKey: "user.name",
    header: "작성자",
    cell: (info) => info.getValue() || "-",
    size: 150,
    enableSorting: false
  },
  {
    accessorKey: "category",
    header: "카테고리",
    cell: (info) => info.getValue() || "-",
    size: 120,
    enableSorting: false
  },
  {
    accessorKey: "title",
    header: "제목",
    cell: (info) => (
      <span className={cn("cursor-pointer text-secondary-foreground hover:underline")}>
        {info.getValue() as string}
      </span>
    ),
    enableSorting: false
  },
  {
    accessorKey: "viewCount",
    header: "조회수",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false
  },
  {
    accessorKey: "commentCount",
    header: "댓글",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false
  },
  {
    accessorKey: "createdAt",
    header: "작성일/시간",
    cell: (info) =>
      formatDate(info.getValue() as string, "YYYY.MM.DD / hh:mm"),
    size: 160,
    enableSorting: true
  }
];

interface ShampooRoomContentProps {
  className?: string;
}

export default function ShampooRoomContent({ className }: ShampooRoomContentProps) {
  const modal = useModal();
  const [selectedShampooRoom, setSelectedShampooRoom] = useState<IShampooRoom | null>(null);
  const [category, setCategory] = useState<string>("ALL");
  const [searchCategory, setSearchCategory] = useState<string>("ALL");

  // cursor-based pagination
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
  const currentCursor = cursorStack[currentCursorIndex];

  const getShampooRoomsQuery = useGetShampooRoomsQuery({
    __nextCursor: currentCursor,
    __limit: 20,
    category: searchCategory === "ALL" ? undefined : (searchCategory as ShampooRoomCategory)
  });

  const dataList = getShampooRoomsQuery.data?.dataList ?? [];
  const nextCursor = getShampooRoomsQuery.data?.__nextCursor;

  const handleSearch = useCallback(() => {
    setSearchCategory(category);
    setCursorStack([undefined]);
    setCurrentCursorIndex(0);
  }, [category]);

  const handleReset = useCallback(() => {
    setCategory("ALL");
    setSearchCategory("ALL");
    setCursorStack([undefined]);
    setCurrentCursorIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    if (!nextCursor) return;
    const newStack = [...cursorStack.slice(0, currentCursorIndex + 1), nextCursor];
    setCursorStack(newStack);
    setCurrentCursorIndex(currentCursorIndex + 1);
  }, [nextCursor, cursorStack, currentCursorIndex]);

  const handlePrev = useCallback(() => {
    if (currentCursorIndex === 0) return;
    setCurrentCursorIndex(currentCursorIndex - 1);
  }, [currentCursorIndex]);

  const handleClickRow = useCallback((row: Row<IShampooRoom>) => {
    setSelectedShampooRoom(row.original);
    modal.open();
  }, [modal]);

  const handleClose = useCallback(() => {
    modal.close();
    setSelectedShampooRoom(null);
  }, [modal]);

  return (
    <div className={cn("shampoo-room-content flex flex-col gap-4", className)}>
      <SearchForm
        onSubmit={handleSearch}
        onRefresh={handleReset}
      >
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

      <div className={cn("flex items-center justify-end gap-2 mt-2")}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentCursorIndex === 0}
        >
          이전
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!nextCursor}
        >
          다음
        </Button>
      </div>

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
