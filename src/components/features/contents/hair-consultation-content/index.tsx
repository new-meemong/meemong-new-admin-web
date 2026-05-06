"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import CommonTable from "@/components/shared/common-table";
import HairConsultationDetailModal from "@/components/features/contents/contents-detail-modal/hair-consultation-detail-modal";
import { IHairConsultationListItem } from "@/models/hairConsultations";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { useGetHairConsultationsQuery } from "@/queries/hairConsultations";
import { useModal } from "@/components/shared/modal/useModal";

const COLUMNS: ColumnDef<IHairConsultationListItem>[] = [
  {
    accessorKey: "id",
    header: "No",
    cell: (info) => info.getValue(),
    size: 80,
    enableSorting: false
  },
  {
    accessorKey: "hairConsultationCreateUserId",
    header: "작성자 ID",
    cell: (info) => info.getValue() || "-",
    size: 120,
    enableSorting: false
  },
  {
    accessorKey: "title",
    header: "제목",
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
    accessorKey: "desiredCostPrice",
    header: "희망비용",
    cell: (info) => {
      const price = info.getValue() as number | null;
      return price != null ? `${price.toLocaleString()}원` : "-";
    },
    size: 120,
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
    accessorKey: "contentUpdatedAt",
    header: "최종수정일",
    cell: (info) => formatDate(info.getValue() as string, "YYYY.MM.DD HH:mm"),
    size: 160,
    enableSorting: true
  }
];

interface HairConsultationContentProps {
  className?: string;
}

export default function HairConsultationContent({
  className
}: HairConsultationContentProps) {
  const modal = useModal();
  const [selected, setSelected] = useState<IHairConsultationListItem | null>(
    null
  );

  // cursor-based pagination
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined
  ]);
  const [cursorIndex, setCursorIndex] = useState(0);

  const currentCursor = cursorStack[cursorIndex];

  const getHairConsultationsQuery = useGetHairConsultationsQuery({
    __limit: 20,
    __nextCursor: currentCursor,
    __orderColumn: "contentUpdatedAt",
    __order: "desc"
  });

  const dataList = getHairConsultationsQuery.data?.dataList ?? [];
  const nextCursor = getHairConsultationsQuery.data?.__nextCursor ?? null;

  const handleNext = useCallback(() => {
    if (!nextCursor) return;
    const newStack = [...cursorStack.slice(0, cursorIndex + 1), nextCursor];
    setCursorStack(newStack);
    setCursorIndex(cursorIndex + 1);
  }, [nextCursor, cursorStack, cursorIndex]);

  const handlePrev = useCallback(() => {
    if (cursorIndex === 0) return;
    setCursorIndex(cursorIndex - 1);
  }, [cursorIndex]);

  const handleClickRow = useCallback(
    (row: Row<IHairConsultationListItem>) => {
      setSelected(row.original);
      modal.open();
    },
    [modal]
  );

  const handleClose = useCallback(() => {
    modal.close();
    setSelected(null);
  }, [modal]);

  return (
    <div
      className={cn("hair-consultation-content flex flex-col gap-4", className)}
    >
      <CommonTable<IHairConsultationListItem>
        data={dataList}
        columns={COLUMNS}
        onClickRow={handleClickRow}
      />

      <div className={cn("flex items-center justify-end gap-2 mt-2")}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={cursorIndex === 0}
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

      {selected && (
        <HairConsultationDetailModal
          isOpen={modal.isOpen}
          onClose={handleClose}
          item={selected}
          onRefresh={() => getHairConsultationsQuery.refetch()}
        />
      )}
    </div>
  );
}
