"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import CommonTable from "@/components/shared/common-table";
import { Button } from "@/components/ui/button";
import UserRightDrawer from "@/components/features/user/user-right-drawer";
import { IMongMoneyGroup } from "@/models/mongMoneys";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { formatMongMoneyAdminDescription } from "@/utils/mongMoneys";
import { useMongMoneyManualDepositsQuery } from "@/queries/mongMoneys";
import { useDrawer } from "@/stores/drawer";
import { MONG_MONEY_GROUP_MAX_LIMIT } from "@/apis/mongMoneys";

const EMPTY_DEPOSITS: IMongMoneyGroup[] = [];

interface MongMoneyDepositManagementPageContentProps {
  className?: string;
}

export default function MongMoneyDepositManagementPageContent({
  className,
}: MongMoneyDepositManagementPageContentProps) {
  const { openDrawer } = useDrawer();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [currentCursorIndex, setCurrentCursorIndex] = useState(0);
  const currentCursor = cursorStack[currentCursorIndex];

  const manualDepositsQuery = useMongMoneyManualDepositsQuery({
    __limit: MONG_MONEY_GROUP_MAX_LIMIT,
    __nextCursor: currentCursor,
  });
  const depositHistories = manualDepositsQuery.data?.dataList ?? EMPTY_DEPOSITS;
  const nextCursor = manualDepositsQuery.data?.__nextCursor ?? null;

  const handleOpenUserDrawer = useCallback(
    (userId?: number) => {
      if (!userId) return;

      setSelectedUserId(userId);
      openDrawer();
    },
    [openDrawer],
  );

  const handleRefresh = useCallback(() => {
    manualDepositsQuery.refetch();
  }, [manualDepositsQuery]);

  const handleNext = useCallback(() => {
    if (!nextCursor || manualDepositsQuery.isPlaceholderData) return;

    setCursorStack((prev) => [
      ...prev.slice(0, currentCursorIndex + 1),
      nextCursor,
    ]);
    setCurrentCursorIndex((prev) => prev + 1);
  }, [currentCursorIndex, nextCursor, manualDepositsQuery.isPlaceholderData]);

  const handlePrev = useCallback(() => {
    if (currentCursorIndex === 0) return;

    setCurrentCursorIndex((prev) => prev - 1);
  }, [currentCursorIndex]);

  const columns = useMemo<ColumnDef<IMongMoneyGroup>[]>(
    () => [
      {
        accessorKey: "id",
        header: "아이디",
        size: 80,
        cell: (info) => info.getValue(),
        enableSorting: false,
      },
      {
        accessorKey: "userId",
        header: "유저 아이디",
        size: 150,
        cell: (info) => {
          const mongMoney = info.row.original;

          return (
            <button
              type="button"
              className={cn(
                "max-w-full cursor-pointer truncate text-secondary-foreground hover:underline",
              )}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenUserDrawer(mongMoney.userId);
              }}
            >
              {mongMoney.userId}
            </button>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: "지급몽",
        size: 110,
        cell: (info) => Number(info.getValue() ?? 0).toLocaleString("ko-KR"),
        enableSorting: false,
      },
      {
        accessorKey: "adminDescription",
        header: "지급메모(처리자)",
        cell: (info) =>
          formatMongMoneyAdminDescription(info.getValue() as string | null),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: "지급일",
        size: 170,
        cell: (info) =>
          formatDate(info.getValue() as string, "YYYY.MM.DD HH:mm") || "-",
        enableSorting: false,
      },
    ],
    [handleOpenUserDrawer],
  );

  return (
    <section
      className={cn("mong-money-deposit-management-page-content", className)}
    >
      <div className="mb-[14px] flex items-center justify-end gap-[12px]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[32px] rounded-4 px-[10px]"
          disabled={manualDepositsQuery.isFetching}
          onClick={handleRefresh}
        >
          <RefreshCw className="h-[14px] w-[14px]" />
          새로고침
        </Button>
      </div>
      {manualDepositsQuery.isLoading ? (
        <div className="rounded-10 border bg-white p-6 text-center text-gray-500">
          불러오는 중...
        </div>
      ) : (
        <CommonTable<IMongMoneyGroup>
          data={depositHistories}
          columns={columns}
        />
      )}
      <div className="mt-[12px] flex items-center justify-end gap-[8px]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[32px] rounded-4 px-[10px]"
          disabled={currentCursorIndex === 0 || manualDepositsQuery.isFetching}
          onClick={handlePrev}
        >
          <ChevronLeft className="h-[14px] w-[14px]" />
          이전
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[32px] rounded-4 px-[10px]"
          disabled={
            !nextCursor ||
            manualDepositsQuery.isFetching ||
            manualDepositsQuery.isPlaceholderData
          }
          onClick={handleNext}
        >
          다음
          <ChevronRight className="h-[14px] w-[14px]" />
        </Button>
      </div>
      {selectedUserId !== null && (
        <UserRightDrawer
          userId={selectedUserId}
          onRefresh={manualDepositsQuery.refetch}
        />
      )}
    </section>
  );
}
